"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface StatCardData {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  bg?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  stats?: StatCardData[];
  actions?: React.ReactNode;
}

const StatCard = ({ title, value, icon, trend, bg }: StatCardData) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-card p-6 rounded-lg border border-border shadow-xs hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-lg ${bg || "bg-muted"} group-hover:scale-110 transition-transform duration-300 text-foreground`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-black text-foreground tracking-tight">
          {value}
        </h3>
      </div>
    </motion.div>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  showRefresh = true,
  stats,
  actions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left side - title/subtitle */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-md sm:text-lg text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              title="Refresh"
              className="hover:bg-accent hover:text-foreground transition-colors rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            stats.length > 2
              ? "lg:grid-cols-2 xl:grid-cols-4"
              : "lg:grid-cols-" + stats.length
          } gap-6`}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Header;
