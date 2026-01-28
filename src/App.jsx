import React, { useState } from 'react';
import { Plus, Search, Apple, Loader2, TrendingUp, BarChart3, Cloud, CloudOff } from 'lucide-react';

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDWQ3z_lvhgPMwa-lO3y5r_w4bj06M2k_M",
  authDomain: "calorie-1456b.firebaseapp.com",
  projectId: "calorie-1456b",
  storageBucket: "calorie-1456b.firebasestorage.app",
  messagingSenderId: "413125107773",
  appId: "1:413125107773:web:77ddcf613a9930ec92ca54",
  measurementId: "G-YKVTQ98X1N"
};

const CalorieTrackerApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [todayEntries, setTodayEntries] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey] = useState('acPbPSwq8ZnpG2NkkW3MW1DLyumVpYJZLBoBHWmM');
  const [useLocalDatabase, setUseLocalDatabase] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customGrams, setCustomGrams] = useState('100');
  const [mealTime, setMealTime] = useState('breakfast');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTime, setCustomTime] = useState(new Date().toTimeString().slice(0, 5));
  const [allHistory, setAllHistory] = useState({});
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // 正在编辑的条目 {date, index, entry}
  const [isEditing, setIsEditing] = useState(false); // 是否处于编辑模式
  const [showCharts, setShowCharts] = useState(false); // 显示图表
  const [chartType, setChartType] = useState('calories'); // calories, protein, carbs, fat
  const [firebaseEnabled, setFirebaseEnabled] = useState(false); // Firebase 是否启用
  const [isSyncing, setIsSyncing] = useState(false); // 是否正在同步
  const [userId, setUserId] = useState(() => {
    // 生成或获取唯一用户ID
    let id = localStorage.getItem('calorieAppUserId');
    if (!id) {
      id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('calorieAppUserId', id);
    }
    return id;
  });

  // Firebase 同步函数
  const syncToFirebase = async (data) => {
    if (!firebaseEnabled) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/calorie-1456b/databases/(default)/documents/users/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              history: {
                stringValue: JSON.stringify(data)
              },
              lastUpdated: {
                timestampValue: new Date().toISOString()
              }
            }
          })
        }
      );
      
      if (!response.ok) {
        console.error('Firebase sync failed:', response.status);
      }
    } catch (error) {
      console.error('Firebase sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 从 Firebase 加载数据
  const loadFromFirebase = async () => {
    if (!firebaseEnabled) return;
    
    setIsSyncing(true);
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/calorie-1456b/databases/(default)/documents/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.fields?.history?.stringValue) {
          const cloudHistory = JSON.parse(data.fields.history.stringValue);
          setAllHistory(cloudHistory);
          localStorage.setItem('calorieHistory', JSON.stringify(cloudHistory));
        }
      }
    } catch (error) {
      console.error('Firebase load error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 从 localStorage 加载历史数据
  React.useEffect(() => {
    const saved = localStorage.getItem('calorieHistory');
    if (saved) {
      try {
        setAllHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
    
    // 检查 Firebase 是否启用
    const firebaseStatus = localStorage.getItem('firebaseEnabled');
    if (firebaseStatus === 'true') {
      setFirebaseEnabled(true);
      loadFromFirebase();
    }
  }, []);

  // 保存历史数据到 localStorage 和 Firebase
  React.useEffect(() => {
    if (Object.keys(allHistory).length > 0) {
      localStorage.setItem('calorieHistory', JSON.stringify(allHistory));
      // 同步到 Firebase
      if (firebaseEnabled) {
        syncToFirebase(allHistory);
      }
    }
  }, [allHistory, firebaseEnabled]);

  // 获取今天的记录
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayEntries(allHistory[today] || []);
  }, [allHistory]);

  // 本地食物数据库（备用）
  const localFoodDatabase = [
    { id: 1, name: '白米饭', calories: 130, protein: 2.6, carbs: 28, fat: 0.3, fiber: 0.3, calcium: 3, iron: 0.3, serving: '100克' },
    { id: 2, name: '鸡胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, calcium: 15, iron: 1, serving: '100克' },
    { id: 3, name: '西兰花', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, calcium: 47, iron: 0.7, serving: '100克' },
    { id: 4, name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, calcium: 5, iron: 0.3, serving: '100克' },
    { id: 5, name: '鸡蛋', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, calcium: 56, iron: 1.8, serving: '100克' },
    { id: 6, name: '燕麦', calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 10.6, calcium: 54, iron: 4.7, serving: '100克' },
    { id: 7, name: '三文鱼', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, calcium: 12, iron: 0.3, serving: '100克' },
    { id: 8, name: '牛奶', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, calcium: 113, iron: 0.03, serving: '100毫升' },
    { id: 9, name: '苹果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, calcium: 6, iron: 0.1, serving: '100克' },
    { id: 10, name: '牛肉', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, calcium: 18, iron: 2.6, serving: '100克' },
  ];

  // 本地搜索食物
  const searchLocalFood = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const filtered = localFoodDatabase.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // 搜索食物（使用 USDA FoodData Central API）
  const searchFood = async (query) => {
    if (!query.trim()) return;
    
    // 如果使用本地数据库
    if (useLocalDatabase) {
      searchLocalFood(query);
      return;
    }
    
    setIsSearching(true);
    try {
      // 使用 USDA FoodData Central API
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('USDA API 返回数据:', data);
        
        if (!data.foods || data.foods.length === 0) {
          setSearchResults([]);
          return;
        }
        
        // 转换 USDA API 返回的数据格式
        const formattedResults = data.foods.map((item, index) => {
          // 从 foodNutrients 数组中提取营养素
          const getNutrient = (nutrientId) => {
            const nutrient = item.foodNutrients?.find(n => n.nutrientId === nutrientId);
            return nutrient?.value || 0;
          };
          
          return {
            id: item.fdcId || Date.now() + index,
            name: item.description || item.lowercaseDescription || 'Unknown',
            calories: Math.round(getNutrient(1008)), // Energy (kcal)
            protein: parseFloat(getNutrient(1003).toFixed(1)), // Protein
            carbs: parseFloat(getNutrient(1005).toFixed(1)), // Carbohydrates
            fat: parseFloat(getNutrient(1004).toFixed(1)), // Total lipid (fat)
            fiber: parseFloat(getNutrient(1079).toFixed(1)), // Fiber
            calcium: Math.round(getNutrient(1087)), // Calcium
            iron: parseFloat(getNutrient(1089).toFixed(1)), // Iron
            serving: '100克'
          };
        });
        
        // 过滤掉没有卡路里数据的食物
        const validResults = formattedResults.filter(item => item.calories > 0);
        
        if (validResults.length === 0) {
          alert('未找到有效的营养数据，已切换到本地数据库。');
          setUseLocalDatabase(true);
          searchLocalFood(query);
        } else {
          setSearchResults(validResults);
        }
      } else {
        console.error('USDA API 请求失败:', response.status);
        alert('API 请求失败，已切换到本地数据库。');
        setUseLocalDatabase(true);
        searchLocalFood(query);
      }
    } catch (error) {
      console.error('搜索食物时出错:', error);
      alert('网络错误，已切换到本地数据库。错误: ' + error.message);
      setUseLocalDatabase(true);
      searchLocalFood(query);
    } finally {
      setIsSearching(false);
    }
  };

  // 使用 useEffect 实现防抖搜索
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchFood(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, apiKey, useLocalDatabase]);

  const addFood = (food) => {
    // 打开克数输入界面
    setSelectedFood(food);
    setCustomGrams('100');
    // 重置为当前日期和时间
    setCustomDate(new Date().toISOString().split('T')[0]);
    setCustomTime(new Date().toTimeString().slice(0, 5));
    setMealTime('breakfast');
  };

  const confirmAddFood = () => {
    if (!selectedFood) return;
    
    // 如果是编辑模式，调用更新函数
    if (isEditing) {
      updateEntry();
      return;
    }
    
    const grams = parseFloat(customGrams) || 100;
    const portion = grams / 100;
    
    // 使用用户选择的日期和时间
    const selectedDateTime = new Date(`${customDate}T${customTime}:00`);
    
    const entryWithPortion = {
      ...selectedFood,
      timestamp: selectedDateTime.toISOString(),
      portion: portion,
      displayGrams: grams,
      mealTime: mealTime,
      date: customDate, // 使用自定义日期
    };
    
    // 更新历史记录
    const updatedHistory = { ...allHistory };
    if (!updatedHistory[customDate]) {
      updatedHistory[customDate] = [];
    }
    updatedHistory[customDate] = [...updatedHistory[customDate], entryWithPortion];
    setAllHistory(updatedHistory);
    
    setSelectedFood(null);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeEntry = (index) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedHistory = { ...allHistory };
    updatedHistory[today] = todayEntries.filter((_, i) => i !== index);
    setAllHistory(updatedHistory);
  };

  // 开始编辑条目
  const startEditEntry = (date, index) => {
    const entry = allHistory[date][index];
    setEditingEntry({ date, index, entry });
    setIsEditing(true);
    
    // 填充编辑表单
    setSelectedFood(entry);
    setCustomGrams(entry.displayGrams.toString());
    setMealTime(entry.mealTime);
    setCustomDate(entry.date);
    const time = new Date(entry.timestamp).toTimeString().slice(0, 5);
    setCustomTime(time);
  };

  // 更新编辑后的条目
  const updateEntry = () => {
    if (!editingEntry) return;
    
    const { date, index } = editingEntry;
    const grams = parseFloat(customGrams) || 100;
    const portion = grams / 100;
    const selectedDateTime = new Date(`${customDate}T${customTime}:00`);
    
    const updatedEntry = {
      ...selectedFood,
      timestamp: selectedDateTime.toISOString(),
      portion: portion,
      displayGrams: grams,
      mealTime: mealTime,
      date: customDate,
    };
    
    const updatedHistory = { ...allHistory };
    
    // 如果日期改变了，需要从原日期删除，添加到新日期
    if (date !== customDate) {
      // 从原日期删除
      updatedHistory[date] = updatedHistory[date].filter((_, i) => i !== index);
      if (updatedHistory[date].length === 0) {
        delete updatedHistory[date];
      }
      // 添加到新日期
      if (!updatedHistory[customDate]) {
        updatedHistory[customDate] = [];
      }
      updatedHistory[customDate] = [...updatedHistory[customDate], updatedEntry];
    } else {
      // 同一天，直接更新
      updatedHistory[date][index] = updatedEntry;
    }
    
    setAllHistory(updatedHistory);
    setEditingEntry(null);
    setIsEditing(false);
    setSelectedFood(null);
  };

  const totalNutrition = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories * entry.portion,
      protein: acc.protein + entry.protein * entry.portion,
      carbs: acc.carbs + entry.carbs * entry.portion,
      fat: acc.fat + entry.fat * entry.portion,
      fiber: acc.fiber + entry.fiber * entry.portion,
      calcium: acc.calcium + entry.calcium * entry.portion,
      iron: acc.iron + entry.iron * entry.portion,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, calcium: 0, iron: 0 }
  );

  const dailyGoal = 2000;
  const calorieProgress = Math.min((totalNutrition.calories / dailyGoal) * 100, 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f5f7, #ffffff)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      padding: '0',
      position: 'relative',
    }}>
      {/* 顶部状态栏 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
        padding: '48px 20px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <h1 style={{
              fontSize: '34px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              margin: 0,
              color: '#1d1d1f',
            }}>营养记录</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  const newStatus = !firebaseEnabled;
                  setFirebaseEnabled(newStatus);
                  localStorage.setItem('firebaseEnabled', newStatus.toString());
                  if (newStatus) {
                    syncToFirebase(allHistory);
                  }
                }}
                style={{
                  background: firebaseEnabled ? '#34c759' : '#f5f5f7',
                  color: firebaseEnabled ? 'white' : '#86868b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isSyncing ? (
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                ) : firebaseEnabled ? (
                  <Cloud size={12} />
                ) : (
                  <CloudOff size={12} />
                )}
                {firebaseEnabled ? '云同步' : '本地'}
              </button>
              <button
                onClick={() => setShowCharts(true)}
                style={{
                  background: '#f5f5f7',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📈 图表
              </button>
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  background: '#f5f5f7',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📊 历史
              </button>
              <button
                onClick={() => setUseLocalDatabase(!useLocalDatabase)}
                style={{
                  background: useLocalDatabase ? '#f5f5f7' : '#34c759',
                  color: useLocalDatabase ? '#86868b' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {useLocalDatabase ? '本地' : 'USDA API'}
              </button>
              <div style={{
                fontSize: '15px',
                color: '#86868b',
                fontWeight: '500',
              }}>
                {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {/* 卡路里进度环 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#f5f5f7"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#ff3b30"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - calorieProgress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  lineHeight: '1',
                  marginBottom: '4px',
                }}>
                  {Math.round(totalNutrition.calories)}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#86868b',
                  fontWeight: '500',
                }}>
                  / {dailyGoal} 千卡
                </div>
              </div>
            </div>
          </div>

          {/* 三大营养素 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '24px',
          }}>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>蛋白质</div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#007aff',
              }}>{Math.round(totalNutrition.protein)}g</div>
            </div>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>碳水</div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#ff9500',
              }}>{Math.round(totalNutrition.carbs)}g</div>
            </div>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '16px 12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '4px',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px',
              }}>脂肪</div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#34c759',
              }}>{Math.round(totalNutrition.fat)}g</div>
            </div>
          </div>

          {/* 微量元素 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '12px',
          }}>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '2px',
                fontWeight: '500',
              }}>膳食纤维</div>
              <div style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#1d1d1f',
              }}>{totalNutrition.fiber.toFixed(1)}g</div>
            </div>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '2px',
                fontWeight: '500',
              }}>钙</div>
              <div style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#1d1d1f',
              }}>{Math.round(totalNutrition.calcium)}mg</div>
            </div>
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '11px',
                color: '#86868b',
                marginBottom: '2px',
                fontWeight: '500',
              }}>铁</div>
              <div style={{
                fontSize: '17px',
                fontWeight: '600',
                color: '#1d1d1f',
              }}>{totalNutrition.iron.toFixed(1)}mg</div>
            </div>
          </div>
        </div>

        {/* 今日记录列表 */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}>
          <div style={{
            padding: '20px 20px 12px',
            borderBottom: '0.5px solid #f5f5f7',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              color: '#1d1d1f',
            }}>今日饮食</h2>
          </div>
          
          {todayEntries.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#86868b',
            }}>
              <Apple size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: '15px' }}>暂无记录</div>
            </div>
          ) : (
            <div>
              {todayEntries.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < todayEntries.length - 1 ? '0.5px solid #f5f5f7' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '17px',
                        fontWeight: '500',
                        color: '#1d1d1f',
                      }}>
                        {entry.name}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        background: entry.mealTime === 'breakfast' ? '#ff9500' : 
                                   entry.mealTime === 'lunch' ? '#34c759' : 
                                   entry.mealTime === 'dinner' ? '#007aff' : '#ff3b30',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}>
                        {entry.mealTime === 'breakfast' ? '早餐' : 
                         entry.mealTime === 'lunch' ? '午餐' : 
                         entry.mealTime === 'dinner' ? '晚餐' : '加餐'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}>
                      {entry.displayGrams || Math.round(entry.portion * 100)}克 · {Math.round(entry.calories * entry.portion)} 千卡 · {new Date(entry.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => startEditEntry(entry.date, index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007aff',
                        fontSize: '15px',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => removeEntry(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff3b30',
                        fontSize: '15px',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 添加按钮 */}
        <button
          onClick={() => setShowSearch(true)}
          style={{
            width: '100%',
            background: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            fontSize: '17px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#0051d5';
            e.target.style.transform = 'scale(0.98)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#007aff';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          添加食物
        </button>
      </div>

      {/* 搜索弹窗 */}
      {showSearch && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => {
            setShowSearch(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px 20px 0 0',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{
              padding: '20px',
              borderBottom: '0.5px solid #f5f5f7',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1d1d1f',
                }}>
                  搜索食物 {!useLocalDatabase && <span style={{ fontSize: '14px', color: '#34c759', fontWeight: '500' }}>(USDA API 🌍)</span>}
                </h3>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '17px',
                    color: '#007aff',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  完成
                </button>
              </div>
              <div style={{
                position: 'relative',
                background: '#f5f5f7',
                borderRadius: '10px',
                padding: '10px 40px 10px 38px',
              }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#86868b',
                  }}
                />
                <input
                  type="text"
                  placeholder={useLocalDatabase ? "搜索本地食物" : "搜索食物（试试 chicken 或 rice）"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    fontSize: '17px',
                    outline: 'none',
                    color: '#1d1d1f',
                  }}
                />
                {isSearching && (
                  <Loader2
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#007aff',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                )}
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0',
            }}>
              {isSearching ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <Loader2 size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '15px' }}>搜索中...</div>
                </div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <Search size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontSize: '15px' }}>未找到相关食物</div>
                  {!useLocalDatabase && <div style={{ fontSize: '13px', marginTop: '8px' }}>试试用英文搜索，如 "chicken" 或 "rice"</div>}
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <Apple size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontSize: '15px' }}>输入食物名称开始搜索</div>
                  {!useLocalDatabase && <div style={{ fontSize: '13px', marginTop: '8px', color: '#34c759' }}>✨ 当前使用 USDA 全球食物数据库</div>}
                </div>
              ) : (
                searchResults.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => addFood(food)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '0.5px solid #f5f5f7',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f7'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '17px',
                          fontWeight: '500',
                          color: '#1d1d1f',
                          marginBottom: '6px',
                        }}>
                          {food.name}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#86868b',
                          marginBottom: '8px',
                        }}>
                          {food.serving} · {food.calories} 千卡
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '12px',
                          color: '#86868b',
                        }}>
                          <span>蛋白 {food.protein}g</span>
                          <span>碳水 {food.carbs}g</span>
                          <span>脂肪 {food.fat}g</span>
                        </div>
                      </div>
                      <Plus size={20} color="#007aff" strokeWidth={2.5} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 克数输入弹窗 */}
      {selectedFood && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setSelectedFood(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'scaleIn 0.3s ease',
            }}
          >
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#1d1d1f',
            }}>
              {isEditing ? '编辑记录' : selectedFood.name}
            </h3>
            
            <div style={{
              fontSize: '15px',
              color: '#86868b',
              marginBottom: '20px',
            }}>
              选择日期、时间和用餐类型
            </div>

            {/* 日期和时间选择 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#86868b',
                  marginBottom: '8px',
                  display: 'block',
                  fontWeight: '500',
                }}>日期</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // 不能选择未来日期
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '10px',
                    outline: 'none',
                    background: 'white',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#86868b',
                  marginBottom: '8px',
                  display: 'block',
                  fontWeight: '500',
                }}>时间</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '10px',
                    outline: 'none',
                    background: 'white',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* 用餐时间选择 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '20px',
            }}>
              {[
                { value: 'breakfast', label: '早餐', emoji: '🌅' },
                { value: 'lunch', label: '午餐', emoji: '☀️' },
                { value: 'dinner', label: '晚餐', emoji: '🌙' },
                { value: 'snack', label: '加餐', emoji: '🍎' },
              ].map(time => (
                <button
                  key={time.value}
                  onClick={() => setMealTime(time.value)}
                  style={{
                    background: mealTime === time.value ? '#007aff' : '#f5f5f7',
                    color: mealTime === time.value ? 'white' : '#1d1d1f',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{time.emoji}</span>
                  <span>{time.label}</span>
                </button>
              ))}
            </div>

            <div style={{
              fontSize: '15px',
              color: '#86868b',
              marginBottom: '12px',
            }}>
              输入克数
            </div>

            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <input
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: '32px',
                    fontWeight: '600',
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    color: '#1d1d1f',
                    textAlign: 'center',
                  }}
                />
                <span style={{
                  fontSize: '20px',
                  color: '#86868b',
                  fontWeight: '500',
                }}>克</span>
              </div>
            </div>

            {/* 营养预览 */}
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '13px',
                color: '#86868b',
                marginBottom: '12px',
                fontWeight: '600',
              }}>营养预览：</div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>卡路里</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff3b30' }}>
                    {Math.round(selectedFood.calories * (parseFloat(customGrams) || 100) / 100)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>蛋白质</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#007aff' }}>
                    {(selectedFood.protein * (parseFloat(customGrams) || 100) / 100).toFixed(1)}g
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>碳水</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff9500' }}>
                    {(selectedFood.carbs * (parseFloat(customGrams) || 100) / 100).toFixed(1)}g
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>脂肪</div>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: '#34c759' }}>
                    {(selectedFood.fat * (parseFloat(customGrams) || 100) / 100).toFixed(1)}g
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷克数按钮 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '20px',
            }}>
              {[50, 100, 150, 200].map(g => (
                <button
                  key={g}
                  onClick={() => setCustomGrams(g.toString())}
                  style={{
                    background: customGrams === g.toString() ? '#007aff' : '#f5f5f7',
                    color: customGrams === g.toString() ? 'white' : '#1d1d1f',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {g}g
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setEditingEntry(null);
                  setIsEditing(false);
                }}
                style={{
                  flex: 1,
                  background: '#f5f5f7',
                  color: '#1d1d1f',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                onClick={confirmAddFood}
                style={{
                  flex: 2,
                  background: '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {isEditing ? '保存修改' : '添加到今日'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录弹窗 */}
      {showHistory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px 20px 0 0',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{
              padding: '20px',
              borderBottom: '0.5px solid #f5f5f7',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1d1d1f',
                }}>历史记录</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '17px',
                    color: '#007aff',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  完成
                </button>
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}>
              {Object.keys(allHistory).length === 0 ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '15px' }}>暂无历史记录</div>
                </div>
              ) : (
                Object.keys(allHistory)
                  .sort((a, b) => b.localeCompare(a)) // 最新日期在前
                  .map(date => {
                    const entries = allHistory[date];
                    if (!entries || entries.length === 0) return null;
                    
                    const dayTotal = entries.reduce((acc, entry) => ({
                      calories: acc.calories + entry.calories * entry.portion,
                      protein: acc.protein + entry.protein * entry.portion,
                      carbs: acc.carbs + entry.carbs * entry.portion,
                      fat: acc.fat + entry.fat * entry.portion,
                    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                    const dateObj = new Date(date);
                    const isToday = date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div
                        key={date}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '16px',
                          marginBottom: '12px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                          border: isToday ? '2px solid #007aff' : '1px solid #f5f5f7',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                        }}>
                          <div>
                            <div style={{
                              fontSize: '17px',
                              fontWeight: '600',
                              color: '#1d1d1f',
                              marginBottom: '4px',
                            }}>
                              {dateObj.toLocaleDateString('zh-CN', { 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                              {isToday && <span style={{ 
                                fontSize: '12px', 
                                color: '#007aff',
                                marginLeft: '8px',
                                background: '#e5f2ff',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}>今天</span>}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: '#86868b',
                            }}>
                              {entries.length} 条记录
                            </div>
                          </div>
                          <div style={{
                            textAlign: 'right',
                          }}>
                            <div style={{
                              fontSize: '24px',
                              fontWeight: '700',
                              color: '#ff3b30',
                            }}>
                              {Math.round(dayTotal.calories)}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#86868b',
                            }}>
                              千卡
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            background: '#f5f5f7',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: '10px', color: '#86868b', marginBottom: '2px' }}>蛋白质</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#007aff' }}>{Math.round(dayTotal.protein)}g</div>
                          </div>
                          <div style={{
                            background: '#f5f5f7',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: '10px', color: '#86868b', marginBottom: '2px' }}>碳水</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ff9500' }}>{Math.round(dayTotal.carbs)}g</div>
                          </div>
                          <div style={{
                            background: '#f5f5f7',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: '10px', color: '#86868b', marginBottom: '2px' }}>脂肪</div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#34c759' }}>{Math.round(dayTotal.fat)}g</div>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '12px',
                          color: '#86868b',
                          borderTop: '1px solid #f5f5f7',
                          paddingTop: '12px',
                        }}>
                          {entries.map((entry, idx) => (
                            <div key={idx} style={{ 
                              marginBottom: idx < entries.length - 1 ? '8px' : 0,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: '500', color: '#1d1d1f' }}>{entry.name}</span>
                                <span style={{ marginLeft: '6px' }}>
                                  {entry.displayGrams}g
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  background: entry.mealTime === 'breakfast' ? '#ff9500' : 
                                             entry.mealTime === 'lunch' ? '#34c759' : 
                                             entry.mealTime === 'dinner' ? '#007aff' : '#ff3b30',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                }}>
                                  {entry.mealTime === 'breakfast' ? '早' : 
                                   entry.mealTime === 'lunch' ? '午' : 
                                   entry.mealTime === 'dinner' ? '晚' : '加'}
                                </span>
                                <span style={{ fontWeight: '600', color: '#1d1d1f' }}>
                                  {Math.round(entry.calories * entry.portion)}
                                </span>
                                <span> 千卡</span>
                                <button
                                  onClick={() => {
                                    setShowHistory(false);
                                    startEditEntry(date, idx);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007aff',
                                    fontSize: '11px',
                                    padding: '4px 6px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                  }}
                                >
                                  编辑
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 图表弹窗 */}
      {showCharts && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setShowCharts(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px 20px 0 0',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s ease',
            }}
          >
            <div style={{
              padding: '20px',
              borderBottom: '0.5px solid #f5f5f7',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#1d1d1f',
                }}>营养趋势</h3>
                <button
                  onClick={() => setShowCharts(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '17px',
                    color: '#007aff',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  完成
                </button>
              </div>

              {/* 图表类型切换 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
              }}>
                {[
                  { value: 'calories', label: '卡路里', color: '#ff3b30' },
                  { value: 'protein', label: '蛋白质', color: '#007aff' },
                  { value: 'carbs', label: '碳水', color: '#ff9500' },
                  { value: 'fat', label: '脂肪', color: '#34c759' },
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    style={{
                      background: chartType === type.value ? type.color : '#f5f5f7',
                      color: chartType === type.value ? 'white' : '#1d1d1f',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
            }}>
              {Object.keys(allHistory).length === 0 ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <TrendingUp size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontSize: '15px' }}>暂无数据</div>
                </div>
              ) : (
                (() => {
                  // 计算最近7天的数据
                  const last7Days = [];
                  const today = new Date();
                  
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    
                    const entries = allHistory[dateStr] || [];
                    const total = entries.reduce((acc, entry) => ({
                      calories: acc.calories + entry.calories * entry.portion,
                      protein: acc.protein + entry.protein * entry.portion,
                      carbs: acc.carbs + entry.carbs * entry.portion,
                      fat: acc.fat + entry.fat * entry.portion,
                    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
                    
                    last7Days.push({
                      date: dateStr,
                      label: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
                      weekday: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
                      ...total
                    });
                  }

                  // 找到最大值用于缩放
                  const maxValue = Math.max(...last7Days.map(d => d[chartType]));
                  const chartColor = chartType === 'calories' ? '#ff3b30' : 
                                    chartType === 'protein' ? '#007aff' : 
                                    chartType === 'carbs' ? '#ff9500' : '#34c759';
                  const unit = chartType === 'calories' ? '千卡' : 'g';
                  const label = chartType === 'calories' ? '卡路里' : 
                               chartType === 'protein' ? '蛋白质' : 
                               chartType === 'carbs' ? '碳水化合物' : '脂肪';

                  return (
                    <div>
                      {/* 图表标题 */}
                      <div style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        color: '#1d1d1f',
                        marginBottom: '8px',
                      }}>
                        过去7天{label}摄入
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#86868b',
                        marginBottom: '24px',
                      }}>
                        平均每日: {Math.round(last7Days.reduce((sum, d) => sum + d[chartType], 0) / 7)} {unit}
                      </div>

                      {/* 折线图 */}
                      <div style={{
                        background: '#f5f5f7',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                      }}>
                        <div style={{
                          position: 'relative',
                          height: '200px',
                        }}>
                          {/* Y轴刻度线 */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                            <div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: `${ratio * 180}px`,
                                borderTop: '1px dashed #e5e5e7',
                                opacity: 0.5,
                              }}
                            >
                              <span style={{
                                position: 'absolute',
                                left: '-8px',
                                top: '-8px',
                                fontSize: '10px',
                                color: '#86868b',
                                transform: 'translateX(-100%)',
                              }}>
                                {Math.round(maxValue * ratio)}
                              </span>
                            </div>
                          ))}

                          {/* 折线图容器 */}
                          <svg
                            width="100%"
                            height="180"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            style={{
                              position: 'absolute',
                              bottom: '20px',
                              left: 0,
                            }}
                          >
                            {/* 折线 */}
                            <polyline
                              points={last7Days.map((day, i) => {
                                const x = (i / (last7Days.length - 1)) * 100;
                                // Y轴留10%空间，使用90%的高度
                                const y = maxValue > 0 ? (10 + (1 - day[chartType] / maxValue) * 80) : 90;
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke={chartColor}
                              strokeWidth="0.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* 实心数据点 */}
                            {last7Days.map((day, i) => {
                              const x = (i / (last7Days.length - 1)) * 100;
                              const y = maxValue > 0 ? (10 + (1 - day[chartType] / maxValue) * 80) : 90;
                              
                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="1.2"
                                  fill={chartColor}
                                />
                              );
                            })}
                          </svg>

                          {/* X轴标签（日期） */}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}>
                            {last7Days.map((day, i) => {
                              const isToday = day.date === new Date().toISOString().split('T')[0];
                              return (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    color: isToday ? '#1d1d1f' : '#86868b',
                                    fontWeight: isToday ? '600' : '500',
                                  }}
                                >
                                  <div>{day.weekday}</div>
                                  <div style={{ fontSize: '10px' }}>{day.label.split('/')[1]}</div>
                                </div>
                              );
                            })}
                          </div>

                          {/* 数值标签 */}
                          {last7Days.map((day, i) => {
                            if (day[chartType] === 0) return null;
                            const x = (i / (last7Days.length - 1)) * 100;
                            const y = maxValue > 0 ? ((1 - day[chartType] / maxValue) * 180) : 180;
                            const isToday = day.date === new Date().toISOString().split('T')[0];
                            
                            return (
                              <div
                                key={`label-${i}`}
                                style={{
                                  position: 'absolute',
                                  left: `${x}%`,
                                  bottom: `${180 - y + 20}px`,
                                  transform: 'translateX(-50%)',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: chartColor,
                                }}
                              >
                                {Math.round(day[chartType])}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 统计卡片 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                      }}>
                        <div style={{
                          background: 'white',
                          border: '1px solid #f5f5f7',
                          borderRadius: '12px',
                          padding: '16px',
                        }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#86868b',
                            marginBottom: '8px',
                          }}>最高值</div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: chartColor,
                          }}>
                            {Math.round(maxValue)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#86868b',
                          }}>{unit}</div>
                        </div>

                        <div style={{
                          background: 'white',
                          border: '1px solid #f5f5f7',
                          borderRadius: '12px',
                          padding: '16px',
                        }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#86868b',
                            marginBottom: '8px',
                          }}>总计（7天）</div>
                          <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: chartColor,
                          }}>
                            {Math.round(last7Days.reduce((sum, d) => sum + d[chartType], 0))}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#86868b',
                          }}>{unit}</div>
                        </div>
                      </div>

                      {/* 建议 */}
                      {chartType === 'calories' && (
                        <div style={{
                          marginTop: '16px',
                          background: '#e5f2ff',
                          borderRadius: '12px',
                          padding: '16px',
                        }}>
                          <div style={{
                            fontSize: '13px',
                            color: '#007aff',
                            fontWeight: '600',
                            marginBottom: '4px',
                          }}>💡 小贴士</div>
                          <div style={{
                            fontSize: '13px',
                            color: '#1d1d1f',
                            lineHeight: '1.5',
                          }}>
                            {Math.round(last7Days.reduce((sum, d) => sum + d.calories, 0) / 7) < 1500
                              ? '你的平均摄入较低，注意营养均衡哦！'
                              : Math.round(last7Days.reduce((sum, d) => sum + d.calories, 0) / 7) > 2500
                              ? '平均摄入较高，可以适当控制一下饮食。'
                              : '摄入量保持在健康范围内，继续保持！'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes drawLine {
          from { 
            stroke-dashoffset: 1000;
          }
          to { 
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CalorieTrackerApp;