module.exports = {
  apps: [
    {
      name: "leo-backend",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      node_args: "--max-old-space-size=1024",
      env: {
        NODE_ENV: "development",
        PORT: process.env.PORT,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
      },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      merge_logs: true,
      logrotate: {
        enabled: true,
        rotateInterval: 'weekly',
        maxSize: '10M',
        keep: 7,
        compress: true,
      },
    },
  ],
};