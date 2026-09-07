export const calculateModificationImpact = (baseCar, modifications) => {
  const baseHorsepower = Number.isFinite(Number(baseCar.horsepower)) ? Number(baseCar.horsepower) : 0;
  const baseTorque = Number.isFinite(Number(baseCar.torque)) ? Number(baseCar.torque) : 0;
  let totalHorsepower = baseHorsepower;
  let totalTorque = baseTorque;
  let totalPrice = 0;
  let totalTopSpeedIncrease = 0;
  let totalAccelerationDelta = 0;
  let totalWeightDelta = 0;

  modifications.forEach((modification) => {
    totalHorsepower += Number(modification.horsepower || 0);
    totalTorque += Number(modification.torque || 0);
    totalPrice += modification.priceType === 'percentage'
      ? (Number(baseCar.price || 0) * Number(modification.price || 0)) / 100
      : Number(modification.price || 0);
    totalTopSpeedIncrease += Number(modification.topSpeed || modification.topSpeedDelta || 0);
    totalAccelerationDelta += Number(modification.acceleration || modification.accelerationDelta || 0);
    totalWeightDelta += Number(modification.weight || modification.weightDelta || 0);
  });

  const newAcceleration = Math.max(
    2,
    Number(baseCar.acceleration || 0) + totalAccelerationDelta
  );

  return {
    baseHorsepower,
    modifiedHorsepower: totalHorsepower,
    horsepowergain: totalHorsepower - baseHorsepower,
    baseTorque,
    modifiedTorque: totalTorque,
    torqueGain: totalTorque - baseTorque,
    baseTopSpeed: baseCar.topSpeed,
    modifiedTopSpeed: Number(baseCar.topSpeed || 0) + totalTopSpeedIncrease,
    topSpeedIncrease: totalTopSpeedIncrease,
    baseAcceleration: baseCar.acceleration,
    modifiedAcceleration: newAcceleration,
    accelerationImprovement: Number(baseCar.acceleration || 0) - newAcceleration,
    baseWeight: baseCar.weight || 0,
    modifiedWeight: Number(baseCar.weight || 0) + totalWeightDelta,
    weightDelta: totalWeightDelta,
    totalPrice: totalPrice,
    modifications: modifications,
  };
};
