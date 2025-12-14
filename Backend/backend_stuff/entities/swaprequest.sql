{
  "name": "SwapRequest",
  "type": "object",
  "properties": {
    "item_id": {
      "type": "string",
      "description": "ID of the clothing item"
    },
    "item_title": {
      "type": "string",
      "description": "Title of the item"
    },
    "item_credits": {
      "type": "number",
      "description": "Credits required"
    },
    "buyer_email": {
      "type": "string",
      "description": "Email of person who wants the item"
    },
    "buyer_name": {
      "type": "string",
      "description": "Name of person who wants the item"
    },
    "seller_email": {
      "type": "string",
      "description": "Email of seller"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "denied"
      ],
      "default": "pending",
      "description": "Status of swap request"
    }
  },
  "required": [
    "item_id",
    "buyer_email",
    "seller_email"
  ]
}