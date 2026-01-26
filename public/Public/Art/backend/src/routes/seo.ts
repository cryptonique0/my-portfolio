import express from 'express';
import { getSitemap, getRobotsTxt, getManifest } from '../controllers/seo';

const router = express.Router();

router.get('/sitemap.xml', getSitemap);
router.get('/robots.txt', getRobotsTxt);
router.get('/manifest.json', getManifest);

export default router;
