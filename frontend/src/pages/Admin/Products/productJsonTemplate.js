const productJsonTemplate = `{
  "name": "Sample Product",
  "sku": "SKU-001",
  "price": 999.99,
  "originalPrice": 1299.99,
  "costPrice": 800,
  "category": "electronics/smartphones",
  "brand": "BrandName",
  "description": "Short product description.",
  "detailedDescription": "Detailed product description (can include HTML).",
  "keyFeatures": [
    "Feature 1",
    "Feature 2"
  ],
  "specifications": [
    { "key": "RAM", "value": "8GB" },
    { "key": "Storage", "value": "128GB" }
  ],
  "stockQuantity": 50,
  "minStockLevel": 5,
  "maxOrderQuantity": 2,
  "paymentModes": ["Full", "COD", "UPI"],
  "images": [
    "https://via.placeholder.com/400"
  ],
  "videoUrl": "https://youtube.com/example",
  "galleryImages": [
    "https://via.placeholder.com/400"
  ],
  "seoTitle": "SEO Title Example",
  "seoDescription": "SEO Description Example",
  "seoKeywords": ["keyword1", "keyword2"],
  "tags": ["tag1", "tag2"],
  "isActive": true,
  "isFeatured": false,
  "isNew": true,
  "isBestseller": false,
  "isDiscounted": true,
  "allowReviews": true,
  "trackQuantity": true,
  "requiresShipping": true,
  "availableFrom": "2024-01-01T00:00:00.000Z",
  "availableUntil": "2024-12-31T23:59:59.999Z",
  "shippingClass": "standard",
  "taxClass": "standard",
  "weight": 0.5,
  "length": 15,
  "width": 7,
  "height": 0.8,
  "color": "Black",
  "material": "Aluminum"
}`;

export default productJsonTemplate;
