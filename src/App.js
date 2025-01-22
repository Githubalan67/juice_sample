import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HydrogenCalculator = () => {
  // Constants
  const ENERGY_PER_KG_H2 = 55;
  const WATER_PER_KG_H2 = 0.009;
  const MAINTENANCE_FACTOR = 0.15;
  const ENERGY_EFFICIENCY = {
    'solar': 0.75,
    'wind': 0.70,
    'grid': 0.65,
    'nuclear': 0.80
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState('production');
  
  // State for form inputs
  const [productionInputs, setProductionInputs] = useState({
    energySource: 'solar',
    energyCost: 0.1,
    waterCost: 2,
    productionCapacity: 500,
    temperature: 80,
    pressure: 30
  });

  const [reverseInputs, setReverseInputs] = useState({
    targetProduction: 1000,
    targetEfficiency: 75,
    targetCost: 4
  });

  // Results state
  const [productionResults, setProductionResults] = useState(null);
  const [reverseResults, setReverseResults] = useState(null);

  // Handle production input changes
  const handleProductionChange = (e) => {
    setProductionInputs({
      ...productionInputs,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    });
  };

  // Handle reverse input changes
  const handleReverseChange = (e) => {
    setReverseInputs({
      ...reverseInputs,
      [e.target.name]: parseFloat(e.target.value)
    });
  };

  // Calculate production analysis
  const calculateProduction = () => {
    const tempFactor = 1 - (Math.abs(productionInputs.temperature - 80) / 200);
    const pressureFactor = 1 - (Math.abs(productionInputs.pressure - 30) / 50);
    const baseEfficiency = ENERGY_EFFICIENCY[productionInputs.energySource];
    const actualEfficiency = baseEfficiency * tempFactor * pressureFactor;

    const energyRequired = ENERGY_PER_KG_H2 * productionInputs.productionCapacity / actualEfficiency;
    const waterRequired = WATER_PER_KG_H2 * productionInputs.productionCapacity;
    
    const energyCostDaily = energyRequired * productionInputs.energyCost;
    const waterCostDaily = waterRequired * productionInputs.waterCost;
    const maintenanceCost = (energyCostDaily + waterCostDaily) * MAINTENANCE_FACTOR;
    
    const totalDailyCost = energyCostDaily + waterCostDaily + maintenanceCost;

    setProductionResults({
      efficiency: (actualEfficiency * 100).toFixed(2),
      energyRequired: energyRequired.toFixed(2),
      waterRequired: waterRequired.toFixed(2),
      totalDailyCost: totalDailyCost.toFixed(2),
      costPerKg: (totalDailyCost / productionInputs.productionCapacity).toFixed(2)
    });
  };

  // Calculate reverse analysis
  const calculateReverse = () => {
    const targetEfficiencyDecimal = reverseInputs.targetEfficiency / 100;
    const requiredEnergy = (ENERGY_PER_KG_H2 * reverseInputs.targetProduction) / targetEfficiencyDecimal;
    const requiredWater = WATER_PER_KG_H2 * reverseInputs.targetProduction;
    const totalDailyCost = reverseInputs.targetCost * reverseInputs.targetProduction;
    const maxEnergyCost = (totalDailyCost / requiredEnergy) * (1 - MAINTENANCE_FACTOR);

    setReverseResults({
      requiredEnergy: requiredEnergy.toFixed(2),
      requiredWater: requiredWater.toFixed(2),
      maxEnergyCost: maxEnergyCost.toFixed(2),
      totalDailyCost: totalDailyCost.toFixed(2)
    });
  };

  // Generate data for production graph
  const generateGraphData = () => {
    const data = [];
    for (let production = 100; production <= 1000; production += 100) {
      const energyRequired = (ENERGY_PER_KG_H2 * production) / ENERGY_EFFICIENCY[productionInputs.energySource];
      const waterRequired = WATER_PER_KG_H2 * production;
      const energyCost = energyRequired * productionInputs.energyCost;
      const waterCost = waterRequired * productionInputs.waterCost;
      const totalCost = (energyCost + waterCost) * (1 + MAINTENANCE_FACTOR);
      
      data.push({
        production,
        energyRequired,
        waterRequired,
        totalCost,
        costPerKg: totalCost / production
      });
    }
    return data;
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Hydrogen Production Calculator</h1>
      
      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 rounded ${activeTab === 'production' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Production Analysis
        </button>
        <button
          onClick={() => setActiveTab('reverse')}
          className={`px-4 py-2 rounded ${activeTab === 'reverse' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Reverse Calculation
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded ${activeTab === 'graph' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Production Graph
        </button>
      </div>

      {/* Production Analysis Form */}
      {activeTab === 'production' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Production Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Energy Source</label>
              <select
                name="energySource"
                value={productionInputs.energySource}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
              >
                <option value="solar">Solar</option>
                <option value="wind">Wind</option>
                <option value="grid">Grid</option>
                <option value="nuclear">Nuclear</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Energy Cost ($/kWh)</label>
              <input
                type="number"
                name="energyCost"
                value={productionInputs.energyCost}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2">Water Cost ($/m³)</label>
              <input
                type="number"
                name="waterCost"
                value={productionInputs.waterCost}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
                step="0.1"
              />
            </div>
            <div>
              <label className="block mb-2">Production Capacity (kg/day)</label>
              <input
                type="number"
                name="productionCapacity"
                value={productionInputs.productionCapacity}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Temperature (°C)</label>
              <input
                type="number"
                name="temperature"
                value={productionInputs.temperature}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Pressure (atm)</label>
              <input
                type="number"
                name="pressure"
                value={productionInputs.pressure}
                onChange={handleProductionChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={calculateProduction}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Calculate
          </button>
          {productionResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Results:</h3>
              <p>System Efficiency: {productionResults.efficiency}%</p>
              <p>Energy Required: {productionResults.energyRequired} kWh</p>
              <p>Water Required: {productionResults.waterRequired} m³</p>
              <p>Total Daily Cost: ${productionResults.totalDailyCost}</p>
              <p>Cost per kg: ${productionResults.costPerKg}</p>
            </div>
          )}
        </div>
      )}

      {/* Reverse Calculation Form */}
      {activeTab === 'reverse' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Reverse Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Target Production (kg/day)</label>
              <input
                type="number"
                name="targetProduction"
                value={reverseInputs.targetProduction}
                onChange={handleReverseChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Target Efficiency (%)</label>
              <input
                type="number"
                name="targetEfficiency"
                value={reverseInputs.targetEfficiency}
                onChange={handleReverseChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Target Cost ($/kg)</label>
              <input
                type="number"
                name="targetCost"
                value={reverseInputs.targetCost}
                onChange={handleReverseChange}
                className="w-full p-2 border rounded"
                step="0.1"
              />
            </div>
          </div>
          <button
            onClick={calculateReverse}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Calculate
          </button>
          {reverseResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Results:</h3>
              <p>Required Energy: {reverseResults.requiredEnergy} kWh</p>
              <p>Required Water: {reverseResults.requiredWater} m³</p>
              <p>Maximum Energy Cost: ${reverseResults.maxEnergyCost}/kWh</p>
              <p>Total Daily Cost: ${reverseResults.totalDailyCost}</p>
            </div>
          )}
        </div>
      )}

      {/* Production Graph */}
      {activeTab === 'graph' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Production Analysis Graph</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateGraphData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="production" label={{ value: 'Production (kg/day)', position: 'bottom' }} />
                <YAxis yAxisId="left" label={{ value: 'Energy (kWh) / Cost ($)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Water (m³)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="energyRequired" name="Energy Required (kWh)" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="waterRequired" name="Water Required (m³)" stroke="#82ca9d" />
                <Line yAxisId="left" type="monotone" dataKey="totalCost" name="Total Cost ($)" stroke="#ff7300" />
                <Line yAxisId="left" type="monotone" dataKey="costPerKg" name="Cost per kg ($)" stroke="#ff0000" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default HydrogenCalculator;
