# Patient Web

Front-end React app for managing patients (view, search, add, edit, delete).

## Prerequisites
- Node.js 18+
- npm
- API available at `http://localhost:8080/patient` (default from code)

## Getting Started
1) Install dependencies  
```bash
npm install
```
2) Start the dev server  
```bash
npm start
```
The app runs on `http://localhost:3000`.

## Features
- View patient list, search by any field
- Add new patient with client-side validation
- Edit patient inline with validation
- Delete patient with confirmation
- View patient details in a modal
- Toast notifications for success/error

## Form Validation Rules
- Required: firstName, lastName, address, city, state, zipCode, phoneNumber, email
- Names/City: letters, spaces, hyphens, apostrophes; 2–100 chars (name), 2–50 (city)
- Email: valid format, max 100 chars, duplicate guarded
- Phone: accepts formats like `(123) 456-7890`, `123-456-7890`, `1234567890`
- Zip: `12345` or `12345-6789`
- Address: 5–100 chars

## Environment
- API base URL is defined in `src/App.js` as `API_URL`. Update it if your backend runs elsewhere.

## Testing
No automated tests are currently set up. You can run the default CRA test runner:
```bash
npm test
```

## Notes
- If backend returns duplicate email errors, the UI shows both field-level and toast errors.
- Toasts auto-dismiss after 5 seconds and can be closed manually.
