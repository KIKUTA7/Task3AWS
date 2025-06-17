# Deploying Your Web Application to AWS EC2

This guide will walk you through the process of deploying your web application (frontend and backend) to an Amazon EC2 instance. By following these steps, you'll make your project accessible on the internet.

## 1. Creating an AWS Account

If you don't already have an AWS account:

1. Go to [https://aws.amazon.com/](https://aws.amazon.com/)
2. Click "Create an AWS Account" or "Sign Up"
3. Follow the registration process (you will need to provide a credit card, but you can use the Free Tier)
4. Once registered, sign in to the AWS Management Console

## 2. Launching an EC2 Instance

1. In the AWS Management Console, search for "EC2" and select the EC2 service
2. Click "Launch instance"
3. Enter a name for your instance 
4. Choose an Amazon Machine Image (AMI):
   - Select "Amazon Linux 2023" (Free tier eligible)
5. Choose an Instance Type:
   - Select "t2.micro" (Free tier eligible)
6. Create a new key pair:
   - Click "Create new key pair"
   - Enter a name for your key pair
   - Select "RSA" and ".pem" format
   - Download the key pair file (.pem) - keep this safe, you'll need it to connect to your instance
7. Network settings:
   - Allow SSH traffic from "Anywhere"
   - Allow HTTP and HTTPS traffic from the internet
8. Configure storage:
   - The default 8 GB is sufficient for most web applications
9. Click "Launch instance"

## 3. Connecting to Your EC2 Instance

1. In the EC2 Dashboard, select your instance
2. Click "Connect"
3. Choose "EC2 Instance Connect" tab
4. Click "Connect" - this will open a browser-based terminal connected to your instance

## 4. Setting Up Your Application on EC2

### Install Required Software

```bash
# Update the system
sudo dnf update -y

# Install Node.js
sudo dnf install -y nodejs

# Verify installation
node -v
npm -v

# Install Git
sudo dnf install -y git
```

### Get Your Application Code on the Server

Clone from Git (if your project is on GitHub/GitLab/etc.):
```bash
git clone https://github.com/yourusername/your-project.git
cd your-project
```

### Install Dependencies

Navigate to your project folder on the EC2 instance:
```bash
cd your-project

# If you have a combined frontend/backend project
npm install

# If you have separate frontend and backend folders
npm install  # for root level dependencies
cd frontend && npm install
cd ../backend && npm install
```

## 5. Configuring Security Groups

To allow access to your application, you need to open the necessary ports:

1. In the EC2 Dashboard, select your instance
2. Go to the "Security" tab
3. Click on the security group link
4. Click "Edit inbound rules"
5. Add the following rules:
   - Type: Custom TCP, Port: 3000 (or your backend port), Source: Anywhere (0.0.0.0/0)
   - Type: Custom TCP, Port: 5173 (or your frontend port), Source: Anywhere (0.0.0.0/0)
6. Click "Save rules"

## 6. Running Your Application

### Modify Frontend Configuration

For a Vite-based React frontend:
```bash
cd frontend

# Create or modify vite.config.js/ts
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
EOF
```

### Update API Endpoint in Frontend

You need to update your frontend code to point to your backend API's new URL:

```bash
# Find files that refer to localhost
grep -r "localhost" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" .

# Update the API URL in the appropriate file(s)
# Replace BACKEND_FILE with the file that contains your API URL
# Replace localhost:3000 with your EC2 public IP and backend port
sed -i 's|http://localhost:3000|http://your-instance-public-ip:3000|g' BACKEND_FILE
```

### Modify Backend Configuration

Ensure your backend server listens on all interfaces:

```bash
# Find your server file (e.g., server.js, index.js, app.js)
# Edit it to listen on all interfaces
sed -i 's/localhost/0.0.0.0/g' backend/src/server.js
# or
sed -i 's/127.0.0.1/0.0.0.0/g' backend/src/server.js
```

### Run Your Application

```bash
# If you have a combined script in package.json
npm run dev

# If you have separate frontend and backend folders
# In one terminal session:
cd backend
npm run dev

# In another terminal session:
cd frontend
npm run dev
```

Access your application in a web browser:
- Frontend: `http://your-instance-public-ip:5173`
- Backend API: `http://your-instance-public-ip:3000/api`

## 7. Keeping Your Application Running

To keep your application running after you disconnect from the SSH session, use PM2:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the backend
cd backend
pm2 start npm --name backend -- run dev

# Start the frontend
cd ../frontend
pm2 start npm --name frontend -- run dev

# Check status
pm2 list

# View logs
pm2 logs

# To stop applications
pm2 stop all

# To restart applications
pm2 restart all

# To make PM2 start on system reboot
pm2 startup
# Follow the instructions that appear
pm2 save
```

For production deployment, you might want to build the frontend and serve it:

```bash
# Build frontend
cd frontend
npm run build

# Serve the built files (install serve if needed)
npm install -g serve
pm2 start serve -- -s dist -l 5173
```

