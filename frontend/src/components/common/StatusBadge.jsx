import { Chip } from '@mui/material';
import {
  HourglassEmpty,
  CheckCircle,
  Cancel,
  Done,
} from '@mui/icons-material';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return { label: 'Pending', color: 'warning', icon: <HourglassEmpty /> };
      case 'Approved':
        return { label: 'Approved', color: 'success', icon: <CheckCircle /> };
      case 'Rejected':
        return { label: 'Rejected', color: 'error', icon: <Cancel /> };
      case 'Completed':
        return { label: 'Completed', color: 'info', icon: <Done /> };
      default:
        return { label: status, color: 'default', icon: null };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      icon={config.icon}
      sx={{ fontWeight: 'medium' }}
    />
  );
};

export default StatusBadge;
