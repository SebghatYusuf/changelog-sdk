'use server'

import { createNextChangelogAdapter } from './create-adapter'

function getActions() {
  return createNextChangelogAdapter().actions
}

export async function createChangelog(input: unknown) {
  return getActions().createChangelog(input)
}

export async function updateChangelog(input: unknown) {
  return getActions().updateChangelog(input)
}

export async function deleteChangelog(id: string) {
  return getActions().deleteChangelog(id)
}

export async function fetchChangelogBySlug(slug: string) {
  return getActions().fetchChangelogBySlug(slug)
}

export async function fetchPublishedChangelogs(page = 1, limit = 10, tags?: string[], search?: string) {
  return getActions().fetchPublishedChangelogs(page, limit, tags, search)
}

export async function fetchAdminChangelogs(page = 1, limit = 20) {
  return getActions().fetchAdminChangelogs(page, limit)
}

export async function fetchAdminChangelogById(id: string) {
  return getActions().fetchAdminChangelogById(id)
}

export async function runAIEnhance(input: unknown) {
  return getActions().runAIEnhance(input)
}

export async function loginAdmin(input: { email: string; password: string }) {
  return getActions().loginAdmin(input)
}

export async function registerAdmin(input: { email: string; password: string; displayName?: string }) {
  return getActions().registerAdmin(input)
}

export async function canRegisterAdmin() {
  return getActions().canRegisterAdmin()
}

export async function logoutAdmin() {
  return getActions().logoutAdmin()
}

export async function checkAdminAuth() {
  return getActions().checkAdminAuth()
}

export async function fetchAISettings() {
  return getActions().fetchAISettings()
}

export async function fetchAIProviderModels(input: unknown) {
  return getActions().fetchAIProviderModels(input)
}

export async function updateAISettings(input: unknown) {
  return getActions().updateAISettings(input)
}

export async function fetchLatestPublishedVersion() {
  return getActions().fetchLatestPublishedVersion()
}

export async function fetchChangelogSettings() {
  return getActions().fetchChangelogSettings()
}

export async function updateChangelogSettings(input: unknown) {
  return getActions().updateChangelogSettings(input)
}
