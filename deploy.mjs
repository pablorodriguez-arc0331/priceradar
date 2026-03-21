import FtpDeploy from 'ftp-deploy';
import { config as loadEnv } from 'dotenv';

loadEnv();

const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: Number(process.env.FTP_PORT) || 21,
  localRoot: './dist',
  remoteRoot: process.env.FTP_REMOTE_PATH,
  include: ['**/*'],
  deleteRemote: false,
  forcePasv: true,
};

ftpDeploy.on('uploading', ({ filename, transferredFileCount, totalFilesCount }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on('log', (data) => console.log(data));
ftpDeploy.on('upload-error', (data) => console.error('Upload error:', data.err));

console.log('Building and deploying to Hostinger...');
ftpDeploy
  .deploy(config)
  .then(() => console.log('Deploy complete!'))
  .catch((err) => {
    console.error('Deploy failed:', err);
    process.exit(1);
  });
