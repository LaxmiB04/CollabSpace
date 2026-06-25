import { useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';

const COLUMNS = ['todo', 'inProgress', 'done'];
const COLUMN_LABELS = { todo: 'To Do', inProgress: 'In Progress', done: 'Done' };

function TaskBoard({ channel, workspace }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
  const { user } = useAuthStore();

  useEffect(() => {
    if (channel) fetchTasks();
  }, [channel]);

  useEffect(() => {
    if (workspace) fetchMembers();
  }, [workspace]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/workspaces/${workspace._id}`);
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${channel._id}`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      const response = await api.post('/tasks', {
        ...newTask,
        channelId: channel._id,
        assignee: newTask.assignee || null,
        dueDate: newTask.dueDate || null,
      });
      setTasks((prev) => [...prev, response.data]);
      setNewTask({ title: '', description: '', priority: 'medium', assignee: '', dueDate: '' });
      setShowForm(false);
      toast.success('Task created!');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? response.data : t)));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (!channel) return null;

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="task-board">
      <div className="task-board-header">
        <h3>Task Board — # {channel.name}</h3>
        <button className="create-task-btn" onClick={() => setShowForm(!showForm)}>
          + New Task
        </button>
      </div>

      {showForm && (
        <div className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <select
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <div className="modal-buttons">
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button onClick={handleCreateTask}>Create</button>
          </div>
        </div>
      )}

      <div className="kanban-board">
        {COLUMNS.map((status) => (
          <div key={status} className="kanban-column">
            <h4 className="column-title">{COLUMN_LABELS[status]}</h4>
            <div className="column-tasks">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div key={task._id} className={`task-card priority-${task.priority}`}>
                    <div className="task-title">{task.title}</div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                    <div className="task-meta">
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className={`due-date-badge ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <div className="task-assignee">
                        {task.assignee.avatar ? (
                          <img src={task.assignee.avatar} alt="assignee" className="assignee-avatar" />
                        ) : (
                          <div className="assignee-avatar-placeholder">{task.assignee.name?.[0]}</div>
                        )}
                        <span>{task.assignee.name}</span>
                      </div>
                    )}
                    <div className="task-actions">
                      {status !== 'todo' && (
                        <button onClick={() => handleStatusChange(task._id, status === 'inProgress' ? 'todo' : 'inProgress')}>
                          ←
                        </button>
                      )}
                      {status !== 'done' && (
                        <button onClick={() => handleStatusChange(task._id, status === 'todo' ? 'inProgress' : 'done')}>
                          →
                        </button>
                      )}
                      {task.createdBy?._id === user?._id && (
                        <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoard;