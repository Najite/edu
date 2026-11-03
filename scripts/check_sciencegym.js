import https from 'node:https';

https.get('https://api.github.com/repos/openags/ScienceGym/contents/assets/cooling_scene_assets_v1/geometry/cooling_operations_lab.glb', {
  headers: { 'User-Agent': 'Node' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const file = JSON.parse(data);
      console.log('Size:', file.size, 'Download URL:', file.download_url);
    } catch (e) {
      console.error(e);
    }
  });
});
