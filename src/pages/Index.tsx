import { useFPEStore } from '@/store/fpe-store';
import { LaneSelectionScreen } from '@/components/fpe/LaneSelectionScreen';
import { LaneDashboard } from '@/components/fpe/LaneDashboard';

const Index = () => {
  const selectedLaneId = useFPEStore((s) => s.selectedLaneId);
  return selectedLaneId ? <LaneDashboard /> : <LaneSelectionScreen />;
};

export default Index;
