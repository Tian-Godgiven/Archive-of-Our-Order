export function getLastCookedColor(lastTime: number): string {
  if (lastTime === 0) return 'text-orange-500';
  const days = Math.floor((Date.now() - lastTime) / (1000 * 60 * 60 * 24));
  if (days < 5) return 'text-blue-500';
  if (days < 15) return 'text-green-500';
  if (days < 30) return 'text-yellow-500';
  return 'text-orange-500';
}

export function getLastCookedText(lastTime: number): string {
  if (lastTime === 0) return '还没做过';
  const days = Math.floor((Date.now() - lastTime) / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天做的';
  if (days === 1) return '昨天做的';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${Math.floor(days / 30)}个月前`;
}
