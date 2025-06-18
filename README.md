# FightYourTax.AI

A property tax analysis application.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp env.sample .env
   # Edit .env with your database credentials and API configuration
   ```

4. Run database migrations:
   ```bash
   npx drizzle-kit migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## FastAPI Backend Migration

We are migrating the backend from Next.js API routes to FastAPI. The new backend is located in the `/api` folder.

### Running FastAPI Backend

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```bash
   uvicorn api.index:app --reload --port 8000
   ```

3. View API documentation at `http://localhost:8000/docs`

### Test the Integration

Visit `http://localhost:3000/hello` to see the integration between Next.js and FastAPI with PostgreSQL database.

## Configuration

The application loads property data from an external API service.

### API Configuration

The `PROPERTY_API_BASE_URL` environment variable is **required**:

```bash
# In your .env file
PROPERTY_API_BASE_URL=http://localhost:9000
```

The application will load property data from:
```
{PROPERTY_API_BASE_URL}/api/v1/properties/account/{accountNumber}?include=buildings,owners
```

**Note**: The API endpoint is required. If not configured, the application will throw an error.

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: FastAPI (migrating from Next.js API routes)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (Next.js) / SQLAlchemy (FastAPI)
- **UI**: Tailwind CSS + shadcn/ui

## Development

- Next.js runs on port 3000
- FastAPI runs on port 8000
- PostgreSQL runs on port 54320 (via Docker)

See `/api/README.md` for more details about the FastAPI backend.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
