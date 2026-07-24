<script>
  import { enhance } from '$app/forms';

  let { data } = $props();
  const product = $derived(data.product || {});
  
  const isNew = $derived(!product.id);
  
  let imagePreview = $state(product.image_url || "");
  let isUploading = $state(false);
  let name = $state(product.name || "");
  let categoryMenuOpen = $state(false);

  // Calculate prices based on base_price and variants
  const tall = $derived(product.variants?.find(v => v.name === 'Tall') || { price_add: 0 });
  const grande = $derived(product.variants?.find(v => v.name === 'Grande') || { price_add: 6000 });
  const venti = $derived(product.variants?.find(v => v.name === 'Venti') || { price_add: 13000 });

  let tallPrice = $state(product.base_price || 0);
  let grandePrice = $state(product.base_price ? product.base_price + grande.price_add : 0);
  let ventiPrice = $state(product.base_price ? product.base_price + venti.price_add : 0);

  let pendingImageBlob = $state(null);

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    isUploading = true;
    
    // Convert to webp on frontend
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const maxSize = 1000;
      let width = img.width;
      let height = img.height;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          isUploading = false;
          alert("Image conversion failed");
          return;
        }
        
        pendingImageBlob = blob;
        imagePreview = URL.createObjectURL(blob);
        isUploading = false;
      }, 'image/webp', 0.9);
    };
    img.src = url;
  }
</script>

<div class="d-flex flex-column gap-4 animation-pageIn">
  <div class="d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
      <a href="/admin/products" class="btn p-2 rounded-circle hover-button shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style="width: 40px; height: 40px;" aria-label="Back to products">
        <i class="bi bi-caret-left-fill fsc-4"></i>
      </a>
      <h1 class="fsc-5 fw-black text-dark m-0">{isNew ? 'New Product' : 'Edit Product'}</h1>
    </div>
    
    {#if !isNew}
      <form action="?/delete" method="POST" use:enhance onsubmit={(e) => !confirm('Are you sure you want to delete this product?') && e.preventDefault()}>
        <button type="submit" class="px-5 py-2 fsc-3 fw-bold rounded-pill border border-2 border-danger text-danger text-nowrap hover-button-danger transition-all d-flex align-items-center gap-2">
          <i class="bi bi-trash3"></i> Delete
        </button>
      </form>
    {/if}
  </div>

  <form action="?/save" method="POST" use:enhance={async ({ formData, cancel }) => {
    if (pendingImageBlob) {
      isUploading = true;
      const safeName = (name || 'Drink').replace(/[^a-zA-Z0-9]/g, '');
      const finalName = `${safeName.toLowerCase() || 'drink'}.webp`;
      const webpFile = new File([pendingImageBlob], finalName, { type: 'image/webp' });
      const uploadData = new FormData();
      uploadData.append('file', webpFile);
      
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        const result = await res.json();
        if (res.ok) {
          formData.set('image_url', result.url);
        } else {
          alert(result.error);
          cancel();
          isUploading = false;
          return;
        }
      } catch (e) {
        alert('Upload failed');
        cancel();
        isUploading = false;
        return;
      }
    }
    
    return async ({ update }) => {
      isUploading = false;
      await update();
    };
  }} class="row g-4">
    <div class="col-12 col-xl-8">
      <div class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200 h-100 d-flex flex-column gap-4">
        
        <div class="d-flex flex-column gap-2">
          <label for="name" class="fsc-3 fw-bold text-dark">Drink Name</label>
          <input type="text" id="name" name="name" bind:value={name} required class="w-100 py-3 px-4 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary transition-all" onfocus={(e) => (e.target.style.borderColor = "var(--color-accent-500)")} onblur={(e) => (e.target.style.borderColor = "")} placeholder="e.g. Caffe Latte" />
        </div>

        <div class="d-flex flex-column gap-2">
          <label for="description" class="fsc-3 fw-bold text-dark">Description</label>
          <textarea id="description" name="description" rows="4" required class="w-100 py-3 px-4 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary transition-all resize-0" onfocus={(e) => (e.target.style.borderColor = "var(--color-accent-500)")} onblur={(e) => (e.target.style.borderColor = "")} placeholder="Enter a delicious description...">{product.description || ""}</textarea>
        </div>

        <div class="d-flex flex-column gap-2">
          <label class="fsc-3 fw-bold text-dark">Category</label>
          <input type="hidden" name="category" value={product.category || 'coffee'} />
          
          <div class="position-relative">
            <button 
              type="button"
              onclick={() => (categoryMenuOpen = !categoryMenuOpen)}
              class="w-100 px-4 py-3 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 hover-button d-flex align-items-center justify-content-between gap-3 text-dark bg-transparent"
            >
              {(product.category || 'coffee') === 'coffee' ? 'Coffee' : 'Non-Coffee'} <i class="bi bi-chevron-down"></i>
            </button>

            {#if categoryMenuOpen}
              <div 
                class="position-absolute bg-white rounded-3 b-shadow-s border border-accent-500 mt-2 py-2 d-flex flex-column animation-slideUp w-100" 
                style="top: 100%; left: 0; z-index: 1040;"
              >
                <button 
                  type="button"
                  onclick={() => { product.category = 'coffee'; categoryMenuOpen = false; }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {(product.category || 'coffee') === 'coffee' ? 'fw-black text-accent-500' : 'fw-medium text-dark'}"
                >
                  Coffee
                </button>
                <button 
                  type="button"
                  onclick={() => { product.category = 'non-coffee'; categoryMenuOpen = false; }}
                  class="curr-item w-100 text-start px-4 py-2 border-0 d-flex align-items-center rounded-0 {(product.category || 'coffee') === 'non-coffee' ? 'fw-black text-accent-500' : 'fw-medium text-dark'}"
                >
                  Non-Coffee
                </button>
              </div>
            {/if}
          </div>
        </div>

        <div class="border-top border-accent-200 mt-2 pt-4 d-flex flex-column gap-4">
          <h3 class="fsc-4 fw-bold text-dark m-0">Pricing (IDR)</h3>
          
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <div class="d-flex flex-column gap-2">
                <label for="tall_price" class="fsc-2 fw-bold text-muted text-uppercase">Tall</label>
                <div class="position-relative">
                  <span class="position-absolute top-50 start-0 translate-middle-y ms-3 fsc-3 fw-bold text-muted">Rp</span>
                  <input type="number" id="tall_price" name="tall_price" bind:value={tallPrice} required min="0" class="w-100 py-3 pe-3 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary" style="padding-left: 3.5rem;" />
                </div>
              </div>
            </div>
            
            <div class="col-12 col-md-4">
              <div class="d-flex flex-column gap-2">
                <label for="grande_price" class="fsc-2 fw-bold text-muted text-uppercase">Grande</label>
                <div class="position-relative">
                  <span class="position-absolute top-50 start-0 translate-middle-y ms-3 fsc-3 fw-bold text-muted">Rp</span>
                  <input type="number" id="grande_price" name="grande_price" bind:value={grandePrice} required min="0" class="w-100 py-3 pe-3 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary" style="padding-left: 3.5rem;" />
                </div>
              </div>
            </div>
            
            <div class="col-12 col-md-4">
              <div class="d-flex flex-column gap-2">
                <label for="venti_price" class="fsc-2 fw-bold text-muted text-uppercase">Venti</label>
                <div class="position-relative">
                  <span class="position-absolute top-50 start-0 translate-middle-y ms-3 fsc-3 fw-bold text-muted">Rp</span>
                  <input type="number" id="venti_price" name="venti_price" bind:value={ventiPrice} required min="0" class="w-100 py-3 pe-3 rounded-3 border border-2 border-accent-200 outline-0 fsc-3 bg-secondary" style="padding-left: 3.5rem;" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <div class="col-12 col-xl-4">
      <div class="bg-white p-4 p-md-5 rounded-4 b-shadow-s border border-accent-200 d-flex flex-column gap-4 sticky-top" style="top: 2rem;">
        
        <h3 class="fsc-4 fw-bold text-dark m-0">Image</h3>
        
        <input type="hidden" name="image_url" value={imagePreview} required />
        
        <label class="ratio ratio-1 bg-secondary rounded-4 border border-2 border-accent-200 border-dashed cursor-pointer overflow-hidden d-flex flex-column justify-content-center align-items-center position-relative transition-all" for="image_upload">
          {#if isUploading}
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-white d-flex flex-column justify-content-center align-items-center z-index-2 opacity-75">
              <div class="spinner-border text-accent-500" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          {/if}

          {#if imagePreview}
            <img src={imagePreview} alt="Preview" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 text-white text-center fsc-3 fw-bold d-flex justify-content-center align-items-center" style="opacity: 0; transition: 0.2s;" onmouseenter={(e) => e.currentTarget.style.opacity = '1'} onmouseleave={(e) => e.currentTarget.style.opacity = '0'}>
              Click to change
            </div>
          {:else}
            <div class="d-flex flex-column align-items-center gap-2 text-muted">
              <i class="bi bi-cloud-arrow-up fsc-5"></i>
              <span class="fsc-3 fw-bold">Upload Image</span>
              <span class="fsc-2">Will be converted to WebP</span>
            </div>
          {/if}
          
          <input type="file" id="image_upload" accept="image/*" class="d-none" onchange={handleFileChange} />
        </label>

        <button type="submit" class="w-100 py-3 px-5 fsc-3 fw-bold rounded-pill border border-2 border-accent-500 text-nowrap hover-button-alt transition-all d-flex justify-content-center align-items-center gap-2" disabled={isUploading || !imagePreview}>
          <i class="bi bi-check2-circle"></i> Save Product
        </button>
      </div>
    </div>
  </form>
</div>

<style>
  .border-dashed { border-style: dashed !important; }
  .z-index-2 { z-index: 2; }
</style>
