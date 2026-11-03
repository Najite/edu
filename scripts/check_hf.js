import https from 'node:https';

https.get('https://huggingface.co/api/datasets/MBZUAI/ChemLab-Assets', { headers: { 'User-Agent': 'Node' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const glbs = json.siblings
        .map(s => s.rfilename)
        .filter(f => f.endsWith('/model.glb') || f.endsWith('.glb'));

      console.log('Total glbs:', glbs.length);
      const names = glbs.map(g => {
        const parts = g.split('/');
        return parts[parts.length - 1] === 'model.glb' ? parts[parts.length - 2] : parts[parts.length - 1];
      });
      const unique = Array.from(new Set(names)).sort();
      console.log('Unique asset names sample (out of ' + unique.length + '):');
      console.log(unique.join(', '));
    } catch (e) {
      console.error(e);
    }
  });
});
