# Project Overview

## What is the Project About?

**Campus Clothing Exchange Platform**

Building a campus-exclusive web app allowing students to exchange clothes without using money.

### Problem Statement
- Overflowing closets
- Hassle of existing resale and donation systems
- Need for a simpler, more accessible solution

### Solution
- Cash-free, credit-based system for wardrobe swapping
- Campus-integrated pickup and messaging
- Student email verification for security

## Features of the Project

### Item Listing
- Upload photos, descriptions, conditions
- Credit-based system (1-2 credits per item)
- Credits earned and spent to keep fair and active

### Campus Integrated Pickup
- Messaging system
- Campus map integration
- Student email verification

### Posting Limits
- Limit to amount of posts a day (prevents spam)

## Credit System

### Initial State
- User downloads app – **0 credits**

### Earning Credits
- User uploads an item – **+1 credit**
- User sells an item – **+1 credit**

### Spending Credits
- User wants an item – **-2 credits**
- "Locking item" – locking in 2 credits that are reserved for this item
- Seller has already posted details on how long item can be locked

### Credit Flow Summary
1. **Download app** → 0 credits
2. **Upload item** → +1 credit (minimum 2 uploads needed to buy first item)
3. **Lock item** → -2 credits (credits are locked for this item)
4. **Complete swap** → Item is transferred
5. **Sell item** → +1 credit

### Credit Balance Rules
- Users need at least 2 credits to purchase an item (2 credits = 1 purchase)
- Credits are locked when an item is reserved
- Credits are refunded if reservation expires
- Fair system: earn credits by listing, spend credits by acquiring

## Tools & Technologies

### Backend
- **Languages**: Python
- **Frameworks**: Flask, FastAPI
- **Database**: MongoDB
- **Services**: Email notifications, image handling

### Frontend
- **Framework**: Next.js, React
- **Design**: Figma
- **Features**: Responsive interface for listings, uploads, search
- **Priority**: Core features first, then map and chat

## Project Structure

### Core Features (Priority 1)
- Item listing and browsing
- Item upload and management
- User authentication
- Credit system
- Profile management

### Additional Features (Priority 2)
- Campus map integration
- Messaging system
- Advanced search and filters

## TODO & Next Steps

### Core Features (In Progress)
- [ ] Complete user authentication flow
- [ ] Implement credit system backend logic
- [ ] Finish item CRUD operations
- [ ] Connect frontend to backend APIs
- [ ] Test end-to-end user flows

### Additional Features (Future)
- [ ] Integrate campus map for pickup locations
- [ ] Build messaging/chat system
- [ ] Add advanced filtering and search
- [ ] Implement email notifications
- [ ] Add location-based filtering

### Testing & Deployment
- [ ] Write comprehensive unit tests
- [ ] Set up integration testing
- [ ] Prepare deployment documentation
- [ ] Deploy to staging environment
- [ ] Perform user acceptance testing

### Documentation
- [ ] Complete API documentation
- [ ] Write setup/installation guide
- [ ] Create user manual
- [ ] Document deployment process
- [ ] Add architecture diagrams

