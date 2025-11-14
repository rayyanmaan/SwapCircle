# Frontend Specifications

## Meeting Notes

### November 1st Notes

- Finalize a logo
- Put everything together into one design for the backend
- Go into GitHub and comment on things to show documentation

### October 26th Notes

#### Landing Page (First Thing Shown)
- **SWAPCIRCLE** (logo/brand name)
- Small tag line
- **"Swap Now"** button
- **"What's New"** / **"New In"** section
- Pop up of login/signup
- Scroll to "How it Works" section
  - Check phia.com for "How it Works" page reference
- Scroll to see "What's New" / "New In" section
- Clicking "Swap Now" takes you to listing page

#### Listing Page
- When filtering for category/size/etc:
  - Option 1: Keep on same page and only show matched tags
  - Option 2: Pop to another page
- Filter for location

#### Upload/Sell Page
- Click "Sell Now" → leads to upload pictures of product
- Add fields:
  - Category tags
  - Condition
  - Branded
  - Size
  - "About this item" description
  - Cost (credits)

## Pages Structure

### Listing Page
**All products listed (technically, the home page)**
- Product cards/grid view
- Categories filter
- Upload a new item button
- Navigation to:
  - Product Page (individual item view)
  - Upload new item page
  - Categories page

### Product Page
**Individual item expansion/view**
- Full item details
- Photos gallery
- Seller information
- Lock/reserve item functionality
- Contact seller options

### Profile Page
**Users' own products and details (Sellers)**
- Upload Item button
- Edit your uploaded items
- User profile information
- Credit balance display: `[----------------------------------------------------4 Credits -{*}-]`

### Authentication Pages
- Login page
- Register page
- Email verification

## Design References

### Inspiration Websites
1. **Hollister landing page** – Landing page design
2. **Poshmark landing page** – Marketplace layout
3. **Depop Categories example** – Category organization
4. **Pinterest Example** – Grid layout inspiration
5. **thredUP landing page** – E-commerce design

### Design Tools
- **Color Palette Generator** – For consistent color scheme
- **Figma** – Design mockups and prototypes

## Categorization

### By Clothing Types

#### Women
- Pants
- Shirts
- Suits
- Shoes
- Accessories

#### Men
- Pants
- Shirts
- Suits
- Shoes
- Accessories

#### Unisex
- Pants
- Shirts
- Shoes
- Accessories

### By Brands
- There will be many different brands
- May not be able to show all brands in filter
- Consider search functionality for brands

## Additional Features

### Filter Options
- Location filter
- Category filter
- Size filter
- Condition filter
- Brand filter (if feasible)

### Additional Considerations
- Two more pages (to be defined)
- Responsive design for mobile and desktop
- Accessibility considerations (WCAG guidelines)
- Performance optimization
- Error handling and user feedback

## Next Steps

### Completed Tasks
- ✅ Page diagrams completed (Oct 25th deadline)
- ✅ Design specifications finalized (Oct 26th)
- ✅ Logo finalized (Nov 1st)

### TODO & Future Improvements

#### Design & UI
- [ ] Finalize responsive design for mobile and desktop
- [ ] Implement accessibility features (WCAG compliance)
- [ ] Create design system/style guide
- [ ] Add loading states and error handling UI
- [ ] Implement smooth transitions and animations

#### Features
- [ ] Implement advanced search functionality
- [ ] Add brand search/filter capability
- [ ] Complete two additional pages (to be defined)
- [ ] Add campus map integration
- [ ] Implement messaging system UI

#### Technical
- [ ] Set up frontend testing framework
- [ ] Optimize image loading and performance
- [ ] Implement error boundaries
- [ ] Add analytics tracking
- [ ] Set up CI/CD for frontend deployment

## Hasnain's Notes

### Categorization by Clothing Types
(See categorization section above for full details)

### Categorization by Brands
- Many different brands available
- May need search functionality rather than full filter list
- Consider popular brands first, then expand

