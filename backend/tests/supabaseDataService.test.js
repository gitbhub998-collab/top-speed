import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCarRecord } from '../src/services/supabaseDataService.js';

test('adds _id alias and fills missing values from seed fallback', () => {
  const fallback = {
    brand: 'BMW',
    model: 'M4',
    year: 2024,
    horsepower: 503,
    torque: 479,
    fuelType: 'Petrol',
    drivetrain: 'AWD',
    acceleration: 3.9,
    topSpeed: 250,
    category: 'Coupe',
    price: 3500000,
    imageUrl: '/images/cars/bmw-m4.jpg',
    description: 'BMW M4',
    isVisible: true,
  };

  const result = normalizeCarRecord({ id: 'abc123', brand: 'BMW', model: 'M4', is_visible: true }, fallback);

  assert.equal(result._id, 'abc123');
  assert.equal(result.id, 'abc123');
  assert.equal(result.brand, 'BMW');
  assert.equal(result.horsepower, 503);
  assert.equal(result.fuelType, 'Petrol');
  assert.equal(result.topSpeed, 250);
  assert.equal(result.imageUrl, '/images/cars/bmw-m4.jpg');
  assert.equal(result.isVisible, true);
});

test('uses explicit values before fallback data', () => {
  const fallback = { horsepower: 400, torque: 500, fuelType: 'Diesel', topSpeed: 200 };
  const result = normalizeCarRecord({ id: 'xyz', horsepower: 600, torque: 700 }, fallback);

  assert.equal(result.horsepower, 600);
  assert.equal(result.torque, 700);
  assert.equal(result.fuelType, 'Diesel');
  assert.equal(result.topSpeed, 200);
});
