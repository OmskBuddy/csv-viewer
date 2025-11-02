import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

const fileCache = new Map();

class CSVProcessor {
  constructor(filePath) {
    this.filePath = filePath;
    this.headers = null;
    this.totalRows = 0;
    this.indexed = false;
  }

  async process() {
    if (fileCache.has(this.filePath)) {
      return fileCache.get(this.filePath);
    }

    return new Promise((resolve, reject) => {
      let rowCount = 0;
      let headersProcessed = false;

      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          this.headers = headerList;
          headersProcessed = true;
        })
        .on('data', (data) => {
          if (!headersProcessed && this.headers === null) {
            this.headers = Object.keys(data);
            headersProcessed = true;
          }
          rowCount++;
        })
        .on('end', () => {
          this.totalRows = rowCount;
          this.indexed = true;
          const fileData = {
            headers: this.headers,
            totalRows: this.totalRows,
            filePath: this.filePath
          };
          fileCache.set(this.filePath, fileData);
          resolve(fileData);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getRows(page = 1, pageSize = 50, searchQuery = null) {
    const results = [];
    const startIndex = (page - 1) * pageSize;
    let skipped = 0;
    let streamComplete = false;

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(this.filePath);
      const csvStream = csv();

      readStream
        .pipe(csvStream)
        .on('data', (row) => {
          if (streamComplete) return;

          if (searchQuery) {
            const rowString = JSON.stringify(row).toLowerCase();
            const query = searchQuery.toLowerCase();
            if (!rowString.includes(query)) {
              return;
            }
          }

          if (skipped < startIndex) {
            skipped++;
            return;
          }

          if (results.length < pageSize) {
            results.push(row);
            
            if (results.length >= pageSize) {
              streamComplete = true;
              readStream.destroy();
              csvStream.destroy();
              resolve(results);
            }
          }
        })
        .on('end', () => {
          if (!streamComplete) {
            streamComplete = true;
            resolve(results);
          }
        })
        .on('error', (error) => {
          if (!streamComplete) {
            streamComplete = true;
            reject(error);
          }
        });
    });
  }

  async search(searchQuery, limit = 100) {
    const results = [];
    const query = searchQuery.toLowerCase();
    let streamComplete = false;

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(this.filePath);
      const csvStream = csv();

      readStream
        .pipe(csvStream)
        .on('data', (row) => {
          if (streamComplete) return;

          if (results.length >= limit) {
            streamComplete = true;
            readStream.destroy();
            csvStream.destroy();
            resolve(results);
            return;
          }

          const rowString = JSON.stringify(row).toLowerCase();
          if (rowString.includes(query)) {
            results.push(row);
            
            if (results.length >= limit) {
              streamComplete = true;
              readStream.destroy();
              csvStream.destroy();
              resolve(results);
            }
          }
        })
        .on('end', () => {
          if (!streamComplete) {
            streamComplete = true;
            resolve(results);
          }
        })
        .on('error', (error) => {
          if (!streamComplete) {
            streamComplete = true;
            reject(error);
          }
        });
    });
  }

  async countTotal(searchQuery = null) {
    if (!searchQuery) {
      const cached = fileCache.get(this.filePath);
      if (cached) {
        return cached.totalRows;
      }
    }

    let count = 0;
    const query = searchQuery ? searchQuery.toLowerCase() : null;

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (query) {
            const rowString = JSON.stringify(row).toLowerCase();
            if (rowString.includes(query)) {
              count++;
            }
          } else {
            count++;
          }
        })
        .on('end', () => {
          resolve(count);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processor = new CSVProcessor(req.file.path);
    const fileData = await processor.process();

    res.json({
      success: true,
      fileId: path.basename(req.file.path),
      headers: fileData.headers,
      totalRows: fileData.totalRows
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/file/:fileId/headers', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const cached = fileCache.get(filePath);
    if (cached) {
      return res.json({ headers: cached.headers });
    }

    const processor = new CSVProcessor(filePath);
    const fileData = await processor.process();

    res.json({ headers: fileData.headers });
  } catch (error) {
    console.error('Headers error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/file/:fileId/rows', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100);
    const searchQuery = req.query.search || null;

    const processor = new CSVProcessor(filePath);
    const [rows, total] = await Promise.all([
      processor.getRows(page, pageSize, searchQuery),
      processor.countTotal(searchQuery)
    ]);

    res.json({
      rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Rows error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/file/:fileId/search', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const searchQuery = req.query.q;
    if (!searchQuery) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const processor = new CSVProcessor(filePath);
    const results = await processor.search(searchQuery, limit);

    res.json({
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/file/:fileId', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.fileId);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      fileCache.delete(filePath);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

