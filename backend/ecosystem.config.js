module.exports = {
  apps: [
    {
      name: "REST SERVER",
      script: "./dist/index.js",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
