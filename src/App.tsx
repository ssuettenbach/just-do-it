import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import PickResultPage from './pages/PickResultPage';
import ManagePage from './pages/ManagePage';
import TaskFormPage from './pages/TaskFormPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pick/:category" element={<PickResultPage />} />
          <Route path="manage" element={<ManagePage tab="open" />} />
          <Route path="manage/history" element={<ManagePage tab="history" />} />
          <Route path="tasks/new" element={<TaskFormPage mode="create" />} />
          <Route path="tasks/:id" element={<TaskFormPage mode="edit" />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
