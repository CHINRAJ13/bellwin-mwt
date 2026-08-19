import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, color }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="p-7 rounded-[24px] transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}
        >
            <div className="flex items-start justify-between">
                <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{title}</span>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <ArrowUpRight size={18} />
                </div>
            </div>
            
            <div className="mb-4">
                <h3 className="text-3xl font-bold" style={{ color: 'var(--secondary)' }}>
                    ${value.toLocaleString()}
                    <span className="text-xl" style={{ color: 'var(--text-muted)' }}>.00</span>
                </h3>
            </div>

            <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                    {trend === 'up' ? '↑' : '↓'} {trendValue}%
                </div>
                <span className="text-xs text-text-muted font-medium">vs last month</span>
            </div>
        </motion.div>
    );
};

export default StatCard;
