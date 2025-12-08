{
  "name": "ClothingItem",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Name of the clothing item"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the item"
    },
    "category": {
      "type": "string",
      "enum": [
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "shoes",
        "accessories"
      ],
      "description": "Category of clothing"
    },
    "size": {
      "type": "string",
      "description": "Size of the item"
    },
    "condition": {
      "type": "string",
      "enum": [
        "like_new",
        "gently_used",
        "good",
        "fair"
      ],
      "description": "Condition of the item"
    },
    "brand": {
      "type": "string",
      "description": "Brand name if applicable"
    },
    "is_branded": {
      "type": "boolean",
      "default": false,
      "description": "Whether item is from a known brand"
    },
    "credits": {
      "type": "number",
      "enum": [
        1,
        2
      ],
      "default": 1,
      "description": "Credits required to acquire item"
    },
    "images": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of image URLs"
    },
    "location": {
      "type": "string",
      "enum": [
        "San Francisco",
        "Berlin",
        "Buenos Aires",
        "Hyderabad",
        "Seoul",
        "Taipei",
        "Tokyo",
        "Other"
      ],
      "description": "Campus or city location"
    },
    "status": {
      "type": "string",
      "enum": [
        "available",
        "locked",
        "sold"
      ],
      "default": "available",
      "description": "Availability status"
    },
    "locked_by": {
      "type": "string",
      "description": "User ID who locked the item"
    },
    "locked_until": {
      "type": "string",
      "format": "date-time",
      "description": "When the lock expires"
    },
    "seller_id": {
      "type": "string",
      "description": "ID of the user selling the item"
    },
    "views": {
      "type": "number",
      "default": 0,
      "description": "Number of views"
    },
    "favorites": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": [],
      "description": "User IDs who favorited this item"
    }
  },
  "required": [
    "title",
    "description",
    "category",
    "size",
    "condition",
    "credits",
    "images",
    "location"
  ]
}