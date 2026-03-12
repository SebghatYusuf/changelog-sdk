'use server'

import { createNextChangelogAdapter } from './create-adapter'

const adapter = createNextChangelogAdapter()
const actions = adapter.actions

export async function createChangelog(input: unknown) {
  return actions.createChangelog(input)
}

export async function updateChangelog(input: unknown) {
  return actions.updateChangelog(input)
}

export async function deleteChangelog(id: string) {
  return actions.deleteChangelog(id)
}

export async function fetchChangelogBySlug(slug: string) {
  return actions.fetchChangelogBySlug(slug)
}

export async function fetchPublishedChangelogs(page = 1, limit = 10, tags?: string[], search?: string) {
  return actions.fetchPublishedChangelogs(page, limit, tags, search)
}

export async function fetchAdminChangelogs(page = 1, limit = 20) {
  return actions.fetchAdminChangelogs(page, limit)
}

export async function fetchAdminChangelogById(id: string) {
  return actions.fetchAdminChangelogById(id)
}

export async function runAIEnhance(input: unknown) {
  return actions.runAIEnhance(input)
}

export async function loginAdmin(password: string) {
  return actions.loginAdmin(password)
}

export async function logoutAdmin() {
  return actions.logoutAdmin()
}

export async function checkAdminAuth() {
  return actions.checkAdminAuth()
}

export async function fetchAISettings() {
  return actions.fetchAISettings()
}

export async function fetchAIProviderModels(input: unknown) {
  return actions.fetchAIProviderModels(input)
}

export async function updateAISettings(input: unknown) {
  return actions.updateAISettings(input)
}

export async function fetchLatestPublishedVersion() {
  return actions.fetchLatestPublishedVersion()
}

export async function fetchChangelogSettings() {
  return actions.fetchChangelogSettings()
}

export async function updateChangelogSettings(input: unknown) {
  return actions.updateChangelogSettings(input)
}
