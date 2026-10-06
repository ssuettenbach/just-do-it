import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '../test/renderWithRouter';
import { Mock } from '../test/_mocks/Mock';
import { TestData } from '../test/TestData';
import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page header with back link to /manage', () => {
    Mock.useBackup.mock();

    const { getByText, getByLabelText } = renderWithRouter(<SettingsPage />);

    expect(getByText('Settings')).toBeInTheDocument();
    expect(getByLabelText('Go back')).toHaveAttribute('href', '/manage');
  });

  it('shows the local data warning text', () => {
    Mock.useBackup.mock();

    const { getByText } = renderWithRouter(<SettingsPage />);

    expect(
      getByText(/Tasks are stored only in this browser's local storage/)
    ).toBeInTheDocument();
    expect(getByText(/no account, server, sync, or analytics/)).toBeInTheDocument();
    expect(getByText(/Data survives closing the app and updates/)).toBeInTheDocument();
    expect(
      getByText(/Data is LOST if site\/browser data is cleared/)
    ).toBeInTheDocument();
    expect(getByText(/We recommend exporting a backup regularly/)).toBeInTheDocument();
  });

  it('shows export backup button and calls exportBackup and downloadBackup on click', async () => {
    const exportBackupMock = vi.fn().mockResolvedValue({
      fileName: 'just-do-it-backup-2026-10-05.json',
      json: '{"test": true}',
    });
    const downloadBackupMock = vi.fn();

    Mock.useBackup.mock({
      exportBackup: exportBackupMock,
      downloadBackup: downloadBackupMock,
    });

    const { user, getByRole, findByText } = renderWithRouter(<SettingsPage />);

    await user.click(getByRole('button', { name: 'Export backup' }));

    expect(exportBackupMock).toHaveBeenCalledOnce();
    expect(downloadBackupMock).toHaveBeenCalledWith(
      'just-do-it-backup-2026-10-05.json',
      '{"test": true}'
    );

    expect(
      await findByText('Backup saved as just-do-it-backup-2026-10-05.json')
    ).toBeInTheDocument();
  });

  it('shows error alert when export fails', async () => {
    const { user, getByText, findByRole } = renderWithRouter(<SettingsPage />);

    Mock.useBackup.mock({
      exportBackup: vi.fn().mockRejectedValue(new Error('Storage error')),
    });

    await user.click(getByText('Export backup'));

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent('Could not create the backup. Storage error');
  });

  it('shows file input for import with correct accept attribute', () => {
    Mock.useBackup.mock();

    const { getByLabelText } = renderWithRouter(<SettingsPage />);

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'application/json,.json');
    expect(input).toHaveAttribute('type', 'file');
  });

  it('shows invalid import errors and no action buttons', async () => {
    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({
        ok: false,
        errors: ['Malformed JSON', 'Invalid format'],
      }),
    });

    const { user, getByLabelText, findByRole, queryByText } = renderWithRouter(
      <SettingsPage />
    );

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(['invalid'], 'backup.json', { type: 'application/json' });

    await user.upload(input, file);

    const alert = await findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('This file can\'t be imported.');
    expect(queryByText('Replace all data')).not.toBeInTheDocument();
    expect(queryByText('Merge import')).not.toBeInTheDocument();
  });

  it('shows valid import summary with Replace and Merge buttons', async () => {
    const tasks = [
      TestData.createTestTask({ status: 'open' }),
      TestData.createTestTask({ status: 'open' }),
      TestData.createTestTask({ status: 'completed' }),
    ];

    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({ ok: true, tasks }),
    });

    const { user, getByLabelText, findByText, getByRole } = renderWithRouter(
      <SettingsPage />
    );

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(TestData.createTestBackupDocument({ tasks }))],
      'backup.json',
      { type: 'application/json' }
    );

    await user.upload(input, file);

    expect(await findByText('3 tasks found (2 open, 1 completed)')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Replace all data' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Merge import' })).toBeInTheDocument();
  });

  it('Replace all data opens confirm dialog, cancel does not call replaceAll', async () => {
    const tasks = [TestData.createTestTask()];

    const replaceAllMock = vi.fn().mockResolvedValue(1);

    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({ ok: true, tasks }),
      replaceAll: replaceAllMock,
    });

    const { user, getByLabelText, findByText, getByText, queryByRole, getByRole } =
      renderWithRouter(<SettingsPage />);

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(TestData.createTestBackupDocument({ tasks }))],
      'backup.json',
      { type: 'application/json' }
    );

    await user.upload(input, file);
    await user.click(getByRole('button', { name: 'Replace all data' }));

    expect(getByText('Replace all data?')).toBeInTheDocument();
    expect(
      getByText(/All current tasks, including history, will be permanently replaced/)
    ).toBeInTheDocument();

    await user.click(getByText('Cancel'));

    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(replaceAllMock).not.toHaveBeenCalled();
  });

  it('Replace all data confirm calls replaceAll and shows success status', async () => {
    const tasks = [TestData.createTestTask()];
    const replaceAllMock = vi.fn().mockResolvedValue(1);

    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({ ok: true, tasks }),
      replaceAll: replaceAllMock,
    });

    const { user, getByLabelText, findByText, getByText, findByRole, getByRole } =
      renderWithRouter(<SettingsPage />);

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(TestData.createTestBackupDocument({ tasks }))],
      'backup.json',
      { type: 'application/json' }
    );

    await user.upload(input, file);
    await user.click(getByRole('button', { name: 'Replace all data' }));
    await user.click(getByText('Replace all data'));

    expect(replaceAllMock).toHaveBeenCalledWith(tasks);
    expect(await findByRole('status')).toHaveTextContent(
      'Replaced all data with 1 tasks.'
    );
  });

  it('Merge import calls merge and shows imported/skipped counts', async () => {
    const tasks = [TestData.createTestTask()];
    const mergeMock = vi.fn().mockResolvedValue({ imported: 1, skipped: 0 });

    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({ ok: true, tasks }),
      merge: mergeMock,
    });

    const { user, getByLabelText, findByText, findByRole, getByRole } = renderWithRouter(
      <SettingsPage />
    );

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(TestData.createTestBackupDocument({ tasks }))],
      'backup.json',
      { type: 'application/json' }
    );

    await user.upload(input, file);
    await user.click(getByRole('button', { name: 'Merge import' }));

    expect(mergeMock).toHaveBeenCalledWith(tasks);
    expect(await findByRole('status')).toHaveTextContent(
      'Imported 1 tasks, skipped 0 already present.'
    );
  });

  it('shows failure alert when replaceAll rejects', async () => {
    const tasks = [TestData.createTestTask()];

    const replaceAllMock = vi.fn().mockRejectedValue(new Error('Write failed'));

    Mock.useBackup.mock({
      validateBackup: vi.fn().mockReturnValue({ ok: true, tasks }),
      replaceAll: replaceAllMock,
    });

    const { user, getByLabelText, findByText, getByText, findByRole, getByRole } =
      renderWithRouter(<SettingsPage />);

    const input = getByLabelText('Choose backup file') as HTMLInputElement;
    const file = new File(
      [JSON.stringify(TestData.createTestBackupDocument({ tasks }))],
      'backup.json',
      { type: 'application/json' }
    );

    await user.upload(input, file);
    const replaceButtons = getAllByRole('button', { name: 'Replace all data' });
    await user.click(replaceButtons[0]);
    await user.click(getByRole('button', { name: 'Replace all data' }));

    expect(await findByRole('alert')).toHaveTextContent(
      'Import failed. Your existing data was not changed. Write failed'
    );
  });

  it('shows works offline text', () => {
    Mock.useBackup.mock();

    const { getByText } = renderWithRouter(<SettingsPage />);

    expect(getByText('Works offline after first load')).toBeInTheDocument();
  });
});
