import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getQualityTrend } from '../api/dashboard_api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function QualityTrend() {
  const [months, setMonths] = useState(6);
  const { data, loading, error } = useFetch(() => getQualityTrend(months), [months]);

  const trendIsPositive = (data?.trendPercentage ?? 0) >= 0;

  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-[24px] mb-[24px] relative overflow-hidden">
      <div className="flex justify-between items-start mb-[16px]">
        <div>
          <h2 className="text-[16px] font-bold text-[#0f2c52] m-0 mb-[8px]">Quality Trend</h2>
          <div className="flex items-end gap-[12px] mb-[4px]">
            <span className="text-[36px] font-[800] text-[#0f2c52] leading-none">
              {data ? `${data.currentScore}%` : '--'}
            </span>
            {data && (
              <span className={`flex items-center gap-[4px] text-[14px] font-bold pb-[4px] ${trendIsPositive ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                {trendIsPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {Math.abs(data.trendPercentage)}%
              </span>
            )}
          </div>
          <span className="text-[12px] text-[#94a3b8]">vs previous month</span>
        </div>

        <select 
          className="bg-white border border-[#e2e8f0] rounded-[8px] p-[8px_12px] text-[13px] font-semibold text-[#0f2c52] outline-none cursor-pointer hover:border-[#cbd5e1]"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        >
          <option value={3}>3 Month</option>
          <option value={6}>6 Month</option>
          <option value={12}>12 Month</option>
        </select>
      </div>

      {loading && <p className="text-slate-500 text-[14px]">Loading chart...</p>}
      {error && <p className="text-red-500 text-[14px]">{error}</p>}

      {!loading && !error && data && data.data && (
        <div className="h-[200px] w-full mt-[20px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#0f2c52', marginBottom: '4px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value}%`, 'Score']}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
