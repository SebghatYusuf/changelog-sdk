'use server'

import {
  checkAdminAuth as checkAdminAuthAction,
  createChangelog as createChangelogAction,
  deleteChangelog as deleteChangelogAction,
  fetchAdminChangelogById as fetchAdminChangelogByIdAction,
  fetchAdminChangelogs as fetchAdminChangelogsAction,
  fetchAIProviderModels as fetchAIProviderModelsAction,
  fetchAISettings as fetchAISettingsAction,
  fetchChangelogBySlug as fetchChangelogBySlugAction,
  fetchChangelogSettings as fetchChangelogSettingsAction,
  fetchLatestPublishedVersion as fetchLatestPublishedVersionAction,
  fetchPublishedChangelogs as fetchPublishedChangelogsAction,
  loginAdmin as loginAdminAction,
  logoutAdmin as logoutAdminAction,
  runAIEnhance as runAIEnhanceAction,
  updateAISettings as updateAISettingsAction,
  updateChangelog as updateChangelogAction,
  updateChangelogSettings as updateChangelogSettingsAction,
} from '../../next/actions'

export async function createChangelog(input: unknown) {
  return createChangelogAction(input)
}

export async function updateChangelog(input: unknown) {
  return updateChangelogAction(input)
}

export async function deleteChangelog(id: string) {
  return deleteChangelogAction(id)
}

export async function fetchChangelogBySlug(slug: string) {
  return fetchChangelogBySlugAction(slug)
}

export async function fetchPublishedChangelogs(page = 1, limit = 10, tags?: string[], search?: string) {
  return fetchPublishedChangelogsAction(page, limit, tags, search)
}

export async function fetchAdminChangelogs(page = 1, limit = 20) {
  return fetchAdminChangelogsAction(page, limit)
}

export async function fetchAdminChangelogById(id: string) {
  return fetchAdminChangelogByIdAction(id)
}

export async function runAIEnhance(input: unknown) {
  return runAIEnhanceAction(input)
}

export async function loginAdmin(password: string) {
  return loginAdminAction(password)
}

export async function logoutAdmin() {
  return logoutAdminAction()
}

export async function checkAdminAuth() {
  return checkAdminAuthAction()
}

export async function fetchAISettings() {
  return fetchAISettingsAction()
}

export async function fetchAIProviderModels(input: unknown) {
  return fetchAIProviderModelsAction(input)
}

export async function updateAISettings(input: unknown) {
  return updateAISettingsAction(input)
}

export async function fetchLatestPublishedVersion() {
  return fetchLatestPublishedVersionAction()
}

export async function fetchChangelogSettings() {
  return fetchChangelogSettingsAction()
}

export async function updateChangelogSettings(input: unknown) {
  return updateChangelogSettingsAction(input)
}
