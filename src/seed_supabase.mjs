import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rapihhocsnmckogsmokp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcGloaG9jc25tY2tvZ3Ntb2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjA0MTgsImV4cCI6MjEwMDUzNjQxOH0.tbxI4stTb6i7TU3hrkqMJpkh--g43K6rHpszsaZoSIQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProducts = [
  { title: 'Belgian Chocolate Brownie', slug: 'belgian-chocolate-brownie', description: 'Rich, fudgy & decadent chocolate brownie.', price: 399, stock: 50, category: 'brownies', badge: 'BESTSELLER', images: ['/images/brownie_belgian.jpg'] },
  { title: 'Walnut Brownie', slug: 'walnut-brownie', description: 'Crunchy walnuts with rich chocolate brownie.', price: 449, stock: 42, category: 'brownies', badge: 'NEW', images: ['/images/brownie_walnut.jpg'] },
  { title: 'Nutella Brownie', slug: 'nutella-brownie', description: 'Gooey Nutella swirl in every bite.', price: 499, stock: 35, category: 'brownies', badge: null, images: ['/images/brownie_nutella.jpg'] },
  { title: 'Biscoff Brownie', slug: 'biscoff-brownie', description: 'Biscoff spread with crunchy biscoff crumbs.', price: 449, stock: 30, category: 'brownies', badge: null, images: ['/images/brownie_biscoff.jpg'] },
  { title: 'Classic Collage Frame', slug: 'classic-collage-frame', description: 'Elegant wooden collage frame.', price: 799, stock: 25, category: 'frames', badge: 'BESTSELLER', images: ['/images/frame_classic.jpg'] },
  { title: 'Minimal Wooden Frame', slug: 'minimal-wooden-frame', description: 'Simple, natural & perfect for any space.', price: 599, stock: 20, category: 'frames', badge: 'NEW', images: ['/images/frame_minimal.jpg'] },
  { title: 'Black Border Frame', slug: 'black-border-frame', description: 'Modern black frame with a premium matte finish.', price: 549, stock: 18, category: 'frames', badge: null, images: ['/images/frame_black.jpg'] },
  { title: 'Memories Collage Frame', slug: 'memories-collage-frame', description: 'Multiple memories, one beautiful frame.', price: 899, stock: 15, category: 'frames', badge: null, images: ['/images/frame_memories.jpg'] },
  { title: 'Premium Gift Hamper', slug: 'premium-gift-hamper', description: 'Luxury hamper with brownies & mug.', price: 1299, stock: 15, category: 'gifts', badge: 'BESTSELLER', images: ['/images/gift_hamper.jpg'] },
  { title: 'Luxury Gift Box', slug: 'luxury-gift-box', description: 'Elegant gift box filled with delights.', price: 1099, stock: 12, category: 'gifts', badge: 'NEW', images: ['/images/gift_luxury.jpg'] },
  { title: 'Brownie Gift Box', slug: 'brownie-gift-box', description: 'Delicious brownies in a gift box.', price: 899, stock: 22, category: 'gifts', badge: null, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'] },
  { title: 'Brownie Bouquet', slug: 'brownie-bouquet', description: 'A unique bouquet made of rich brownies.', price: 1199, stock: 10, category: 'gifts', badge: 'NEW', images: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'] },
];

async function seed() {
  console.log('Seeding 12 products to Supabase...');
  const { data, error } = await supabase.from('products').insert(sampleProducts).select('*');
  if (error) {
    console.error('Seed error:', error);
  } else {
    console.log('SUCCESSFULLY SEEDED!', data.length, 'products added to Supabase database!');
  }
}

seed();
