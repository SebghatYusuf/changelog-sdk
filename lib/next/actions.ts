'use server'

import { createNextChangelogAdapter } from './create-adapter'
import { isLogEnabled, logApiRequest, sanitizePayload } from '../core/log'

function getActions() {
  return createNextChangelogAdapter().actions
}

function logAction(name: string, payload?: unknown) {
  if (!isLogEnabled()) return
  logApiRequest('next.action', {
    name,
    payload: sanitizePayload(payload),
  })
}

export async function createChangelog(input: unknown) {
  logAction('createChangelog', input)
  return getActions().createChangelog(input)
}

export async function updateChangelog(input: unknown) {
  logAction('updateChangelog', input)
  return getActions().updateChangelog(input)
}

export async function deleteChangelog(id: string) {
  logAction('deleteChangelog', { id })
  return getActions().deleteChangelog(id)
}

export async function fetchChangelogBySlug(slug: string) {
  logAction('fetchChangelogBySlug', { slug })
  return getActions().fetchChangelogBySlug(slug)
}

export async function fetchPublishedChangelogs(page = 1, limit = 10, tags?: string[], search?: string) {
  logAction('fetchPublishedChangelogs', { page, limit, tags, search })
  return getActions().fetchPublishedChangelogs(page, limit, tags, search)
}

export async function fetchAdminChangelogs(page = 1, limit = 20) {
  logAction('fetchAdminChangelogs', { page, limit })
  return getActions().fetchAdminChangelogs(page, limit)
}

export async function fetchAdminChangelogById(id: string) {
  logAction('fetchAdminChangelogById', { id })
  return getActions().fetchAdminChangelogById(id)
}

export async function runAIEnhance(input: unknown) {
  logAction('runAIEnhance', input)
  return getActions().runAIEnhance(input)
}

export async function loginAdmin(input: { email: string; password: string }) {
  logAction('loginAdmin', input)
  return getActions().loginAdmin(input)
}

export async function registerAdmin(input: { email: string; password: string; displayName?: string }) {
  logAction('registerAdmin', input)
  return getActions().registerAdmin(input)
}

export async function canRegisterAdmin() {
  logAction('canRegisterAdmin')
  return getActions().canRegisterAdmin()
}

export async function logoutAdmin() {
  logAction('logoutAdmin')
  return getActions().logoutAdmin()
}

export async function checkAdminAuth() {
  logAction('checkAdminAuth')
  return getActions().checkAdminAuth()
}

export async function fetchAISettings() {
  logAction('fetchAISettings')
  return getActions().fetchAISettings()
}

export async function fetchAIProviderModels(input: unknown) {
  logAction('fetchAIProviderModels', input)
  return getActions().fetchAIProviderModels(input)
}

export async function updateAISettings(input: unknown) {
  logAction('updateAISettings', input)
  return getActions().updateAISettings(input)
}

export async function fetchLatestPublishedVersion() {
  logAction('fetchLatestPublishedVersion')
  return getActions().fetchLatestPublishedVersion()
}

export async function fetchChangelogSettings() {
  logAction('fetchChangelogSettings')
  return getActions().fetchChangelogSettings()
}

export async function updateChangelogSettings(input: unknown) {
  logAction('updateChangelogSettings', input)
  return getActions().updateChangelogSettings(input)
}

export async function fetchRepoSettings() {
  logAction('fetchRepoSettings')
  return getActions().fetchRepoSettings()
}

export async function updateRepoSettings(input: unknown) {
  logAction('updateRepoSettings', input)
  return getActions().updateRepoSettings(input)
}

export async function previewRepoCommits(input: unknown) {
  logAction('previewRepoCommits', input)
  return getActions().previewRepoCommits(input)
}

export async function generateChangelogFromCommits(input: unknown) {
  logAction('generateChangelogFromCommits', input)
  return getActions().generateChangelogFromCommits(input)
}
