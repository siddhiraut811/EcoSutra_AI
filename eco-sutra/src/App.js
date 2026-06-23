import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Zap, Award, TrendingDown, Flame, Shield, Crown, Target } from 'lucide-react';
import './App.css';

export default function EcoSutraGamified() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState({
    name: 'Eco Warrior',
    carKm: 50,
    carType: 0.21,
    busKm: 20,
    flightHours: 5,
    electricity: 300,
    energySource: 0.37,
    gas: 10,
    water: 50,
    diet: 2.7,
    shopping: 20,
    waste: 5,
    recycling: 30,
  });

  const [history, setHistory] = useState([]);
  const [results, setResults] = useState(null);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem('carbonFootprintData');
    const savedHistory = localStorage.getItem('carbonFootprintHistory');
    const savedAchievements = localStorage.getItem('ecoSutraAchievements');
    
    if (savedData) setUserData(JSON.parse(savedData));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    
    calculateFootprint();
  }, []);

  useEffect(() => {
    localStorage.setItem('carbonFootprintData', JSON.stringify(userData));
  }, [userData]);

  const calculateFootprint = () => {
    const {
      carKm, carType, busKm, flightHours,
      electricity, energySource, gas, water,
      diet, shopping, waste, recycling
    } = userData;

    const carEmissions = (carKm * carType * 52) / 1000;
    const busEmissions = (busKm * 0.089 * 52) / 1000;
    const flightEmissions = (flightHours * 800 * 0.255) / 1000;
    const transportTotal = carEmissions + busEmissions + flightEmissions;

    const electricityEmissions = (electricity * energySource * 12) / 1000;
    const gasEmissions = (gas * 2.04 * 12) / 1000;
    const waterEmissions = (water * 0.37 * 12) / 1000;
    const energyTotal = electricityEmissions + gasEmissions + waterEmissions;

    const dietTotal = diet;

    const shoppingEmissions = (shopping * 0.15 * 12) / 1000;
    const wasteEmissions = (waste * 0.5 * 52) / 1000;
    const recyclingReduction = (wasteEmissions * (recycling / 100)) / 2;
    const lifestyleTotal = Math.max(0, shoppingEmissions + wasteEmissions - recyclingReduction);

    const grandTotal = transportTotal + energyTotal + dietTotal + lifestyleTotal;

    const newResults = {
      total: parseFloat(grandTotal.toFixed(2)),
      transport: parseFloat(transportTotal.toFixed(2)),
      energy: parseFloat(energyTotal.toFixed(2)),
      diet: parseFloat(dietTotal.toFixed(2)),
      lifestyle: parseFloat(lifestyleTotal.toFixed(2)),
      date: new Date().toLocaleDateString(),
      timestamp: new Date().getTime(),
    };

    setResults(newResults);
    
    const xp = Math.floor((4 - grandTotal) * 100);
    setLevel(Math.floor(xp / 500) + 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
    calculateFootprint();
  };

  const saveToHistory = () => {
    if (results) {
      const newHistory = [
        ...history,
        { ...results, id: Date.now() }
      ].sort((a, b) => a.timestamp - b.timestamp);
      setHistory(newHistory.slice(-30));
    }
  };

  const chartData = history.length > 0 ? history.map((item, idx) => ({
    name: `W${idx + 1}`,
    total: item.total
  })) : [];

  const getEcoLevel = (total) => {
    if (total <= 1.5) return { level: 'ENLIGHTENED', emoji: '🧘', color: 'from-purple-600 to-pink-600' };
    if (total <= 2.5) return { level: 'ADVANCED', emoji: '🌟', color: 'from-blue-600 to-cyan-600' };
    if (total <= 4) return { level: 'DEVELOPING', emoji: '🌱', color: 'from-green-600 to-emerald-600' };
    if (total <= 6) return { level: 'BEGINNER', emoji: '🌍', color: 'from-yellow-600 to-orange-600' };
    return { level: 'CRITICAL', emoji: '⚠️', color: 'from-red-600 to-orange-600' };
  };

  const ecoLevel = results ? getEcoLevel(results.total) : getEcoLevel(0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, rgb(75, 0, 130), rgb(75, 0, 130), rgb(128, 0, 128))',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white'
    }}>
      {/* Header */}
      <header style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '4px solid rgb(168, 85, 247)',
        padding: '2rem 1.5rem'
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '3rem', animation: 'bounce 1s infinite' }}>🌍</div>
              <div>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  margin: '0',
                  backgroundImage: 'linear-gradient(to right, rgb(192, 132, 250), rgb(244, 114, 182), rgb(34, 211, 238))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ECO SUTRA
                </h1>
                <p style={{
                  color: 'rgb(216, 180, 254)',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  margin: '0'
                }}>
                  WISDOM FOR A SUSTAINABLE EARTH
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgb(216, 180, 254)', fontSize: '0.875rem', fontWeight: 'bold', margin: '0.5rem 0' }}>YOUR LEVEL</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgb(253, 224, 71)', margin: '0' }}>{level}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
        display: 'flex',
        gap: '0.5rem',
        padding: '0 1.5rem',
        overflowX: 'auto',
        position: 'sticky',
        top: '0',
        zIndex: '10'
      }}>
        {[
          { id: 'dashboard', label: '🎮 DASHBOARD' },
          { id: 'calculator', label: '📊 CALCULATE' },
          { id: 'achievements', label: '🏆 ACHIEVEMENTS' },
          { id: 'leaderboard', label: '👑 WISDOM' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid rgb(168, 85, 247)' : 'none',
              color: activeTab === tab.id ? 'rgb(168, 85, 247)' : 'rgb(216, 180, 254)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {results && (
              <div style={{
                background: `linear-gradient(to bottom right, rgb(168, 85, 247), rgb(236, 72, 153))`,
                borderRadius: '1.5rem',
                padding: '3rem',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{ecoLevel.emoji}</div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{results.total}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>tons CO₂e/year</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{ecoLevel.level}</div>
                <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                  {results.total < 2 ? '🧘 You are enlightened' : results.total < 4 ? '✨ Keep improving' : '🌱 Begin your journey'}
                </p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {results && [
                { icon: '🚗', label: 'TRANSPORT', value: results.transport, target: 0.5, color: 'from-orange-500 to-red-500' },
                { icon: '⚡', label: 'ENERGY', value: results.energy, target: 0.5, color: 'from-blue-500 to-cyan-500' },
                { icon: '🍽️', label: 'DIET', value: results.diet, target: 1.2, color: 'from-green-500 to-emerald-500' },
                { icon: '🛍️', label: 'LIFESTYLE', value: results.lifestyle, target: 0.3, color: 'from-purple-500 to-pink-500' },
              ].map((item, idx) => {
                const progress = Math.min(100, (item.target / item.value) * 100);
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'linear-gradient(to bottom right, rgba(124, 58, 255, 0.5), rgba(236, 72, 153, 0.5))',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      color: 'white',
                      boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                      transform: 'scale(1)',
                      transition: 'transform 0.3s'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                    <p style={{ fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{item.label}</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>{item.value}</p>
                    <div style={{
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '9999px',
                      height: '0.75rem',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          backgroundColor: 'white',
                          height: '100%',
                          width: `${Math.min(100, progress)}%`,
                          transition: 'width 0.5s'
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>Target: {item.target}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setActiveTab('calculator')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
                  color: 'white',
                  padding: '1rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s'
                }}
              >
                📊 RECALCULATE NOW
              </button>
              <button
                onClick={saveToHistory}
                style={{
                  flex: 1,
                  background: 'linear-gradient(to right, rgb(6, 182, 212), rgb(59, 130, 246))',
                  color: 'white',
                  padding: '1rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.3s'
                }}
              >
                💾 SAVE PROGRESS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '2px solid rgba(168, 85, 247, 0.3)'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'rgb(216, 180, 254)' }}>📊 CARBON CALCULATOR</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'rgb(216, 180, 254)' }}>Car (km/week)</label>
                <input
                  type="number"
                  name="carKm"
                  value={userData.carKm}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgb(168, 85, 247)',
                    color: 'rgb(216, 180, 254)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'rgb(216, 180, 254)' }}>Electricity (kWh)</label>
                <input
                  type="number"
                  name="electricity"
                  value={userData.electricity}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgb(168, 85, 247)',
                    color: 'rgb(216, 180, 254)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'rgb(216, 180, 254)' }}>Diet</label>
                <select
                  name="diet"
                  value={userData.diet}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgb(168, 85, 247)',
                    color: 'rgb(216, 180, 254)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="2.7">🍔 Omnivore (2.7 t/yr)</option>
                  <option value="1.9">🍗 Moderate (1.9 t/yr)</option>
                  <option value="1.5">🥬 Vegetarian (1.5 t/yr)</option>
                  <option value="1.2">🌱 Vegan (1.2 t/yr)</option>
                </select>
              </div>
            </div>

            {results && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '1rem',
                padding: '1.5rem',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                <p style={{ color: 'rgb(216, 180, 254)', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>INSTANT FEEDBACK</p>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  backgroundImage: 'linear-gradient(to right, rgb(250, 204, 21), rgb(236, 72, 153))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}>
                  {results.total}
                </div>
                <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 'bold' }}>tons CO₂e/year</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'rgb(216, 180, 254)' }}>🏆 YOUR ACHIEVEMENTS</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                { icon: '👑', title: 'ECO CHAMPION', desc: 'Carbon < 2 tons', earned: results && results.total < 2 },
                { icon: '🚴', title: 'CAR-FREE WARRIOR', desc: 'Transport < 0.5 tons', earned: results && results.transport < 0.5 },
                { icon: '🌱', title: 'PLANT-BASED SAGE', desc: 'Diet < 1.5 tons', earned: results && results.diet < 1.5 },
              ].map((ach, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '2px solid',
                    borderColor: ach.earned ? 'rgb(250, 204, 21)' : 'rgb(75, 85, 99)',
                    background: ach.earned ? 'rgba(250, 204, 21, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{ach.icon}</div>
                  <h4 style={{ color: ach.earned ? 'rgb(250, 204, 21)' : 'rgb(107, 114, 128)', fontSize: '1.25rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {ach.title}
                  </h4>
                  <p style={{ color: ach.earned ? 'rgb(250, 204, 21)' : 'rgb(107, 114, 128)', margin: '0' }}>
                    {ach.desc}
                  </p>
                  {ach.earned && <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgb(250, 204, 21)', fontWeight: 'bold' }}>✓ UNLOCKED</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'rgb(216, 180, 254)' }}>🧘 ECO WISDOM</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {[
                {
                  title: 'The Transportation Mantra',
                  wisdom: 'Every km you walk, bike, or transit saves 0.21 kg CO₂e. Switching to public transport saves 2.6 tons annually.',
                  emoji: '🚗'
                },
                {
                  title: 'The Energy Doctrine',
                  wisdom: 'Renewable energy produces 95% less carbon than coal. One solar panel saves 0.5 tons annually.',
                  emoji: '⚡'
                },
                {
                  title: 'The Diet Principle',
                  wisdom: 'Going vegan for one day saves 1.5 kg CO₂e. That\'s 550 kg per year just by skipping meat once weekly.',
                  emoji: '🌱'
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(168, 85, 247, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '2px solid rgba(168, 85, 247, 0.5)',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.emoji}</div>
                  <h4 style={{ color: 'rgb(216, 180, 254)', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>{item.title}</h4>
                  <p style={{ color: 'rgb(229, 231, 235)', lineHeight: '1.6', fontStyle: 'italic' }}>{item.wisdom}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{
        borderTop: '1px solid rgba(168, 85, 247, 0.3)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        marginTop: '3rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          backgroundImage: 'linear-gradient(to right, rgb(192, 132, 250), rgb(236, 72, 153))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem'
        }}>
          🌍 ECO SUTRA
        </p>
        <p style={{ color: 'rgb(216, 180, 254)', fontSize: '0.875rem', margin: '0' }}>Wisdom for a sustainable earth • Your journey, your impact</p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
