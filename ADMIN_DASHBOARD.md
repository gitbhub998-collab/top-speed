# Admin Dashboard - Complete Setup & Usage Guide

## 🔐 Authentication & Access Control

### Admin Email Configuration
The admin dashboard is automatically available to the user with this email:
```
belalmohamedyousry@gmail.com
```

### How Admin Access Works
1. **Automatic Role Assignment**: When a user registers with the admin email, they automatically get the `admin` role
2. **Backend Validation**: The admin middleware checks both the `role` field and the email to ensure security
3. **Frontend Gating**: The Dashboard link only appears in the navigation when the user is authenticated as an admin

## 📊 Dashboard Features

### 1. **Inventory Management (Cars Tab)**
Allows you to manage all cars in your showroom inventory without touching code.

#### Features:
- ✅ **Add New Cars**: Complete form with all vehicle specifications
  - Brand, Model, Year
  - Performance specs (HP, Torque, 0-100 time, Top Speed)
  - Engine details (Displacement, Cylinders, Type)
  - Fuel Type (Petrol, Diesel, Hybrid, Electric)
  - Drivetrain (RWD, FWD, AWD, 4WD)
  - Category (Sedan, SUV, Sports, Hatchback, Coupe, Truck)
  - Price in AED
  - Description and Image URL
  - Visibility toggle (show/hide from public site)

- ✅ **Edit Existing Cars**: Click the blue edit button to modify any car details
  - All fields are editable
  - Changes save immediately to database
  - Success notification confirms the update

- ✅ **Delete Cars**: Click the red delete button to remove a car
  - Confirmation dialog prevents accidental deletion
  - Deletes car and all associated modifications

- ✅ **Toggle Visibility**: Click the eye icon to show/hide cars from the public website
  - Green "Visible" badge = appears on public site
  - Gray "Hidden" badge = not visible to customers

### 2. **Pricing Tab**
Quick pricing management interface for all vehicles.

#### Features:
- 📊 **Pricing Table**: View all cars and their current prices
- 💰 **Quick Edit**: Click "Edit" button on any row to modify the price
- 📈 **Sorted Display**: Cars organized with their categories and current pricing

### 3. **Modifications Tab**
Manage modification types and pricing (currently view-only, ready for expansion).

#### Features:
- 🔧 Display all available modification types
- 📝 Shows modification details (type, horsepower gain, torque boost)
- Ready to add edit/delete functionality

## 🚀 Step-by-Step Usage Guide

### Registration as Admin
1. Go to the signup page
2. Enter name and password
3. **Use the admin email**: `belalmohamedyousry@gmail.com`
4. Verify OTP from email
5. You'll automatically get admin access

### First Time Setup - Adding Cars
1. Log in with the admin email
2. Click the "Dashboard" link in the navigation (yellow lock icon)
3. Click "Add New Car" button
4. Fill in all required fields (marked with *)
5. Click "Add Car" to save
6. Success message confirms the car was added
7. Vehicle appears immediately in the inventory list

### Editing Car Details
1. In the Inventory tab, find the car you want to edit
2. Click the blue "Edit" button
3. Modify any fields you need to change
4. Click "Update Car" to save changes
5. The car list updates automatically

### Managing Prices
#### Method 1: From Inventory Tab
1. Click the green dollar icon ($) on any car
2. Enter the new price in AED
3. Click "Save" in the modal

#### Method 2: From Pricing Tab
1. Go to the "Pricing" tab
2. Find the car in the table
3. Click "Edit" button
4. Enter the new price
5. Click "Save"

### Controlling Car Visibility
1. In the Inventory tab, find the car
2. Click the eye icon (👁️) to toggle visibility
3. Green "Visible" = appears on public site
4. Gray "Hidden" = hidden from customers

## 🔧 Technical Details

### Backend Changes
- **Updated Auth Controller**: Automatically assigns admin role to the specified email
- **Updated Middleware**: Validates admin access using both role and email
- **Token Generation**: Includes email in JWT for secure verification

### Frontend Updates
- **New AdminDashboard Component**: Full-featured admin interface
- **Updated Navigation**: Shows Dashboard link only for admins
- **API Integration**: Uses existing car service endpoints with admin auth

### API Endpoints Used
All endpoints are already implemented and secured with admin middleware:
- `POST /api/cars` - Create new car
- `PUT /api/cars/:id` - Update car details
- `DELETE /api/cars/:id` - Delete car
- `GET /api/cars` - Get all cars

## ⚙️ Settings & Configuration

### Environment Setup
No additional environment variables needed. The admin email is hardcoded in:
- Frontend: `frontend/src/components/Navigation.jsx`
- Backend: `backend/src/middleware/auth.js`
- Auth Controller: `backend/src/controllers/authController.js`

### Database
All data is stored in MongoDB:
- Car collection: Contains all vehicle information
- User collection: Stores admin user with role assignment

## 📋 Quick Reference

### Admin Dashboard URL
```
http://localhost:5000/admin  (development)
https://yourdomain.com/admin (production)
```

### Key Keyboard/UI Tips
- Green buttons = Actions (Save, Add)
- Blue buttons = Edit
- Red buttons = Delete
- Yellow buttons = Dangerous operations
- Success messages appear for 3 seconds after each action

## 🛡️ Security Features

1. **Email-based Admin Check**: Only the specified email gets admin role
2. **JWT Token Verification**: All admin requests verified with valid token
3. **Admin Middleware**: Backend enforces admin requirement on all protected routes
4. **Protection on Frontend**: Dashboard route ensures user is logged in before showing
5. **Confirmation Dialogs**: Delete operations require confirmation

## 📞 Maintenance & Support

### Common Issues & Solutions

**Issue**: Dashboard link doesn't appear
- **Solution**: Make sure you're logged in with the correct admin email
- **Check**: Look at the user name in navigation - should be your registered name

**Issue**: Changes not saving
- **Solution**: Check internet connection and ensure you see the success message
- **Check**: Refresh page if needed to see updated data

**Issue**: Form validation errors
- **Solution**: Ensure all required fields (marked *) are filled
- **Check**: Horsepower, Torque, Engine Displacement, Cylinders must be numbers

**Issue**: Can't delete a car
- **Solution**: Make sure you confirmed the deletion dialog
- **Check**: Check browser console for any error messages

## 🎯 Production Deployment Checklist

Before launching to your client:

- [ ] Test complete admin workflow (add, edit, delete cars)
- [ ] Test pricing updates work correctly
- [ ] Verify cars appear/disappear on public site when visibility toggled
- [ ] Test with multiple cars to ensure performance
- [ ] Create at least one test car for demonstration
- [ ] Document the admin email for client reference
- [ ] Test on mobile devices (tablets, phones)
- [ ] Verify success messages display correctly
- [ ] Test form validation with invalid data
- [ ] Check database backups are working

## 🔄 Future Enhancements

The dashboard is built to be extensible. Future additions can include:
- Modification type management (edit/delete modifications)
- Bulk import from CSV
- Car image upload (instead of URL)
- Analytics dashboard (sales, modifications purchased)
- Customer management
- Service maintenance scheduling
- Commission tracking for sales staff

---

**This is a production-ready admin dashboard for your TOP SPEED automotive platform.**
