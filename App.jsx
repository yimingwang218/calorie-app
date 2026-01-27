import React, { useState } from 'react';
import { Plus, Search, TrendingUp, Apple, Flame, Activity, Loader2 } from 'lucide-react';

const CalorieTrackerApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [todayEntries, setTodayEntries] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false); // 改为 false，先不强制要求 API Key
  const [useLocalDatabase, setUseLocalDatabase] = useState(true); // 默认使用本地数据库

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
    { id: 11, name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, calcium: 10, iron: 0.3, serving: '100克' },
    { id: 12, name: '黄瓜', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, calcium: 16, iron: 0.3, serving: '100克' },
    { id: 13, name: '胡萝卜', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, calcium: 33, iron: 0.3, serving: '100克' },
    { id: 14, name: '豆腐', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, calcium: 350, iron: 5.4, serving: '100克' },
    { id: 15, name: '鸡腿肉', calories: 181, protein: 20, carbs: 0, fat: 10.9, fiber: 0, calcium: 11, iron: 0.9, serving: '100克' },
    { id: 16, name: '酸奶', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, calcium: 121, iron: 0.05, serving: '100克' },
    { id: 17, name: '全麦面包', calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7, calcium: 107, iron: 2.5, serving: '100克' },
    { id: 18, name: '菠菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, calcium: 99, iron: 2.7, serving: '100克' },
    { id: 19, name: '橙子', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, calcium: 40, iron: 0.1, serving: '100克' },
    { id: 20, name: '红薯', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, calcium: 30, iron: 0.6, serving: '100克' },
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

  // 搜索食物（使用 API Ninjas）
  const searchFood = async (query) => {
    if (!query.trim()) return;
    
    // 如果使用本地数据库
    if (useLocalDatabase || !apiKey) {
      searchLocalFood(query);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'X-Api-Key': apiKey
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('API 返回数据:', data); // 调试信息
        
        // 转换 API 返回的数据格式
        const formattedResults = data.map((item, index) => ({
          id: Date.now() + index,
          name: item.name,
          calories: Math.round(item.calories),
          protein: item.protein_g,
          carbs: item.carbohydrates_total_g,
          fat: item.fat_total_g,
          fiber: item.fiber_g || 0,
          calcium: (item.calcium_mg || 0),
          iron: (item.iron_mg || 0),
          serving: `${item.serving_size_g}克`
        }));
        setSearchResults(formattedResults);
      } else {
        const errorText = await response.text();
        console.error('API 请求失败:', response.status, errorText);
        alert(`API 请求失败，已切换到本地数据库。错误: ${response.status === 401 ? 'API Key 无效' : errorText}`);
        setUseLocalDatabase(true);
        searchLocalFood(query);
      }
    } catch (error) {
      console.error('搜索食物时出错:', error);
      alert('API 调用失败，已切换到本地数据库。');
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
  }, [searchQuery, apiKey]);

  const addFood = (food) => {
    setTodayEntries([...todayEntries, { ...food, timestamp: new Date(), portion: 1 }]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const removeEntry = (index) => {
    setTodayEntries(todayEntries.filter((_, i) => i !== index));
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

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('nutritionApiKey', apiKey);
      setShowApiKeyInput(false);
    }
  };

  // 页面加载时检查是否有保存的 API Key
  React.useEffect(() => {
    const savedKey = localStorage.getItem('nutritionApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setShowApiKeyInput(false);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f5f7, #ffffff)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
      padding: '0',
      position: 'relative',
    }}>
      {/* API Key 设置弹窗 */}
      {showApiKeyInput && (
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
          }}
          onClick={() => setShowApiKeyInput(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
                color: '#1d1d1f',
              }}>数据源设置</h2>
              <button
                onClick={() => setShowApiKeyInput(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#86868b',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: '1',
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              background: '#f5f5f7',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '15px',
                color: '#1d1d1f',
                fontWeight: '500',
              }}>
                <input
                  type="checkbox"
                  checked={useLocalDatabase}
                  onChange={(e) => setUseLocalDatabase(e.target.checked)}
                  style={{ marginRight: '12px', width: '20px', height: '20px' }}
                />
                使用本地数据库（20种常见食物）
              </label>
            </div>

            {!useLocalDatabase && (
              <>
                <p style={{
                  fontSize: '15px',
                  color: '#86868b',
                  marginBottom: '16px',
                  lineHeight: '1.5',
                }}>
                  使用 API Ninjas 搜索全球食物数据库。<br />
                  访问 <a href="https://api-ninjas.com/register" target="_blank" rel="noopener noreferrer" style={{ color: '#007aff' }}>api-ninjas.com/register</a> 免费注册并获取 API Key。
                </p>
                <input
                  type="text"
                  placeholder="粘贴你的 API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '17px',
                    border: '1px solid #d2d2d7',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    outline: 'none',
                    fontFamily: 'monospace',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#007aff'}
                  onBlur={(e) => e.target.style.borderColor = '#d2d2d7'}
                />
              </>
            )}
            
            <button
              onClick={saveApiKey}
              style={{
                width: '100%',
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
              保存设置
            </button>
          </div>
        </div>
      )}
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
                onClick={() => setShowApiKeyInput(true)}
                style={{
                  background: useLocalDatabase ? '#f5f5f7' : '#007aff',
                  color: useLocalDatabase ? '#86868b' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {useLocalDatabase ? '本地数据' : 'API'}
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
                      fontSize: '17px',
                      fontWeight: '500',
                      color: '#1d1d1f',
                      marginBottom: '4px',
                    }}>
                      {entry.name}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#86868b',
                    }}>
                      {entry.serving} · {Math.round(entry.calories * entry.portion)} 千卡
                    </div>
                  </div>
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
                }}>搜索食物</h3>
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
                  placeholder="搜索食物名称（中文或英文）"
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
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>试试用英文搜索，如 "chicken" 或 "rice"</div>
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#86868b',
                }}>
                  <Apple size={48} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontSize: '15px' }}>输入食物名称开始搜索</div>
                  <div style={{ fontSize: '13px', marginTop: '8px' }}>支持中文和英文</div>
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
                          <span>蛋白 {food.protein.toFixed(1)}g</span>
                          <span>碳水 {food.carbs.toFixed(1)}g</span>
                          <span>脂肪 {food.fat.toFixed(1)}g</span>
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
      `}</style>
    </div>
  );
};

export default CalorieTrackerApp;