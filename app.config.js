import fs from 'fs';
import path from 'path';

// Si on est sur les serveurs EAS et qu'on a le secret
if (process.env.EAS_BUILD && process.env.GOOGLE_SERVICES_JSON) {
  const fileContent = process.env.GOOGLE_SERVICES_JSON;
  // Décode le contenu base64 ou écrit le JSON directement (selon ce qu'on a mis)
  const isBase64 = !fileContent.trim().startsWith('{');
  const finalContent = isBase64 ? Buffer.from(fileContent, 'base64').toString('utf8') : fileContent;
  
  fs.writeFileSync(path.resolve(__dirname, 'google-services.json'), finalContent);
  console.log('✅ wrote google-services.json from EAS Secret');
}

export default ({ config }) => {
  return config;
};
