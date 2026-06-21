import { getSupabase } from './supabase.js'

const sb = () => {
  const c = getSupabase()
  if (!c) throw new Error('Supabase not configured')
  return c
}

// ---------- Workspaces & members ----------
export async function listWorkspaces() {
  const { data, error } = await sb()
    .from('workspaces').select('*').order('is_personal', { ascending: false }).order('created_at')
  if (error) throw error
  return data
}

export async function createWorkspace(name, userId) {
  const { data, error } = await sb().from('workspaces')
    .insert({ name, owner_id: userId, is_personal: false }).select().single()
  if (error) throw error
  await sb().from('workspace_members').insert({ workspace_id: data.id, user_id: userId, role: 'owner' })
  return data
}

export async function listMembers(workspaceId) {
  const { data, error } = await sb().from('workspace_members')
    .select('user_id, role, profiles:profiles!workspace_members_user_id_fkey(id,email,full_name,avatar_url)')
    .eq('workspace_id', workspaceId)
  if (error) throw error
  return data
}

export async function inviteMember(workspaceId, email, role = 'member', invitedBy) {
  const { data, error } = await sb().from('invites')
    .upsert({ workspace_id: workspaceId, email: email.toLowerCase(), role, invited_by: invitedBy },
            { onConflict: 'workspace_id,email' }).select().single()
  if (error) throw error
  return data
}

export async function listInvites(workspaceId) {
  const { data, error } = await sb().from('invites').select('*').eq('workspace_id', workspaceId)
  if (error) throw error
  return data
}

export async function removeInvite(id) {
  const { error } = await sb().from('invites').delete().eq('id', id)
  if (error) throw error
}

export async function removeMember(workspaceId, userId) {
  const { error } = await sb().from('workspace_members').delete()
    .eq('workspace_id', workspaceId).eq('user_id', userId)
  if (error) throw error
}

// ---------- Contexts ----------
export async function listContexts(workspaceId) {
  const { data, error } = await sb().from('contexts').select('*').eq('workspace_id', workspaceId).order('name')
  if (error) throw error
  return data
}
export async function createContext(workspaceId, name, color) {
  const { data, error } = await sb().from('contexts')
    .insert({ workspace_id: workspaceId, name, color }).select().single()
  if (error) throw error
  return data
}
export async function deleteContext(id) {
  const { error } = await sb().from('contexts').delete().eq('id', id); if (error) throw error
}

// ---------- Projects ----------
export async function listProjects(workspaceId) {
  const { data, error } = await sb().from('projects').select('*')
    .eq('workspace_id', workspaceId).order('position').order('created_at')
  if (error) throw error
  return data
}
export async function createProject(workspaceId, fields, userId) {
  const { data, error } = await sb().from('projects')
    .insert({ workspace_id: workspaceId, owner_id: userId, ...fields }).select().single()
  if (error) throw error
  return data
}
export async function updateProject(id, fields) {
  const { data, error } = await sb().from('projects').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteProject(id) {
  const { error } = await sb().from('projects').delete().eq('id', id); if (error) throw error
}

// ---------- Tasks ----------
export async function listTasks(workspaceId) {
  const { data, error } = await sb().from('tasks').select('*')
    .eq('workspace_id', workspaceId).order('position').order('created_at')
  if (error) throw error
  return data
}
export async function createTask(workspaceId, fields, userId) {
  const { data, error } = await sb().from('tasks')
    .insert({ workspace_id: workspaceId, created_by: userId, position: Date.now(), ...fields })
    .select().single()
  if (error) throw error
  return data
}
export async function updateTask(id, fields) {
  const { data, error } = await sb().from('tasks').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteTask(id) {
  const { error } = await sb().from('tasks').delete().eq('id', id); if (error) throw error
}

// ---------- Comments ----------
export async function listComments(taskId) {
  const { data, error } = await sb().from('comments')
    .select('*, author:profiles!comments_author_id_fkey(id,email,full_name)')
    .eq('task_id', taskId).order('created_at')
  if (error) throw error
  return data
}
export async function addComment(taskId, body, authorId) {
  const { data, error } = await sb().from('comments')
    .insert({ task_id: taskId, body, author_id: authorId }).select().single()
  if (error) throw error
  return data
}
