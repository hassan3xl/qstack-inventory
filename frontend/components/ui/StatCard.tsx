const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="bg-muted border border-border rounded-lg p-6">
    <div className="flex justify-between mb-2">
      <div className="p-3 bg-accent rounded-lg">{icon}</div>
    </div>
    <p className="text-accent text-sm">{title}</p>
    <p className="text-3xl font-bold text-primary">{value}</p>
  </div>
);

export default StatCard;
