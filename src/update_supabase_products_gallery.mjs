import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const productGalleries = [
  { slug: 'belgian-chocolate-brownie', images: ['/images/brownie_belgian.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'walnut-brownie', images: ['/images/brownie_walnut.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'walnut-fudge-brownie', images: ['/images/brownie_walnut.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'nutella-brownie', images: ['/images/brownie_nutella.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'nutella-swirl-brownie', images: ['/images/brownie_nutella.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'biscoff-brownie', images: ['/images/brownie_biscoff.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'lotus-biscoff-brownie', images: ['/images/brownie_biscoff.jpg', '/images/home_brownies.jpg', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=800&auto=format&fit=crop'] },
  
  { slug: 'classic-collage-frame', images: ['/images/frame_classic.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'minimal-wooden-frame', images: ['/images/frame_minimal.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'minimalist-white-frame', images: ['/images/frame_minimal.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'black-border-frame', images: ['/images/frame_black.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'black-gallery-frame', images: ['/images/frame_black.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'memories-collage-frame', images: ['/images/frame_memories.jpg', '/images/home_frames.jpg', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop'] },

  { slug: 'premium-gift-hamper', images: ['/images/gift_hamper.jpg', '/images/home_gifts.jpg', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'luxury-gift-box', images: ['/images/gift_luxury.jpg', '/images/home_gifts.jpg', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'] },
  { slug: 'brownie-gift-box', images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', '/images/home_gifts.jpg', '/images/brownie_belgian.jpg'] },
  { slug: 'brownie-bouquet', images: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', '/images/home_gifts.jpg', '/images/brownie_nutella.jpg'] }
];

async function updateProducts() {
  console.log('Updating Supabase products table images...');
  for (const item of productGalleries) {
    const { data, error } = await supabase
      .from('products')
      .update({ images: item.images })
      .eq('slug', item.slug);
      
    if (error) {
      console.error(`Error updating ${item.slug}:`, error.message);
    } else {
      console.log(`Updated ${item.slug} with ${item.images.length} images.`);
    }
  }
  
  // Verify all products in table
  const { data: allProds } = await supabase.from('products').select('title, slug, images');
  console.log('\n--- VERIFICATION OF ALL DB PRODUCTS ---');
  allProds?.forEach(p => {
    console.log(`${p.title} (${p.slug}): ${p.images?.length || 0} images`);
  });
}

updateProducts();
