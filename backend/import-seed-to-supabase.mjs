import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const seedPath = path.resolve('seed.js');
const content = fs.readFileSync(seedPath, 'utf8');
const match = content.match(/const carsData = \[(.*?)\n\s*];/s);
if (!match) {
  throw new Error('Could not locate carsData array in seed.js');
}

const carsDataText = match[1];
const rawCars = [];
const objectRegex = /\{([\s\S]*?)\n\s*\}/g;
let obj;
while ((obj = objectRegex.exec(carsDataText))) {
  const block = obj[1];
  const car = {};
  const propRegex = /(brand|model|year|engine|horsepower|torque|fuelType|acceleration|topSpeed|drivetrain|category|price|imageUrl|description|isVisible)\s*:\s*([^,\n]+)/g;
  let prop;
  while ((prop = propRegex.exec(block))) {
    const [, key, rawValue] = prop;
    let value = rawValue.trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    if (/^\d+(\.\d+)?$/.test(value)) value = Number(value);
    car[key] = value;
  }
  if (car.brand && car.model) rawCars.push(car);
}

const rows = rawCars.map((car) => ({
  brand: car.brand,
  model: car.model,
  year: car.year ?? null,
  horsepower: car.horsepower ?? 0,
  torque: car.torque ?? 0,
  price: car.price ?? null,
  description: car.description ?? null,
  is_visible: car.isVisible ?? true,
  created_at: new Date().toISOString(),
}));

const batchSize = 50;
let inserted = 0;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const { data, error } = await supabase.from('cars').insert(batch).select('id');
  if (error) {
    console.error('Insert failed at batch', i, error);
    process.exit(1);
  }
  inserted += data?.length ?? 0;
  console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${data?.length ?? 0}`);
}

console.log(`Finished inserting ${inserted} cars into Supabase.`);
