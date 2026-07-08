async function run() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwaG9uZWRlYWxzLmNvLnVrIiwiaWF0IjoxNzgzNTAxNjE1LCJleHAiOjE3ODM1MDUyMTV9.0FFNKogA9PGaJdZFu44RQeEwxvvxs3_H1kDjG-IUOwI';
  
  // Create a product
  const createRes = await fetch('http://localhost:8787/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      name: 'Test Delete Product ' + Date.now(),
      slug: 'test-delete-product-' + Date.now(),
      category_id: 1,
      is_active: true
    })
  });
  const createData = await createRes.json();
  console.log('Create product:', createData);
  if (!createData.success) return;

  const pid = createData.data.id;
  
  // Try deleting
  console.log('Deleting product:', pid);
  const delRes = await fetch(`http://localhost:8787/api/admin/products/${pid}`, { 
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const delData = await delRes.json();
  console.log('Delete response:', delData);
  
  // Fetch again
  const getRes = await fetch(`http://localhost:8787/api/admin/products/${pid}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const getData = await getRes.json();
  console.log('Fetch deleted product:', getData);
}

run();
