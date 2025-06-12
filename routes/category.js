const router = require('express').Router();
const categoryControlller = require('../controllers/categoryController')
const {verifyAdmin} = require('../middleware/verifyToken')


router.put('/:id',verifyAdmin, categoryControlller.updateCatgory)

router.post('/',verifyAdmin, categoryControlller.createCategory)

router.delete('/:id',verifyAdmin, categoryControlller.deleteCategory)

router.post('/image/:id',verifyAdmin, categoryControlller.patchCategoryImage)


router.get('/', categoryControlller.getAllCategories)

router.get('/random', categoryControlller.getRandomCategories)

module.exports = router;