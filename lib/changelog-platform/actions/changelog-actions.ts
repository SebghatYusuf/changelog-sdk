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
  registerAdmin as registerAdminAction,
  canRegisterAdmin as canRegisterAdminAction,
  logoutAdmin as logoutAdminAction,
  runAIEnhance as runAIEnhanceAction,
  updateAISettings as updateAISettingsAction,
  updateChangelog as updateChangelogAction,
  updateChangelogSettings as updateChangelogSettingsAction,
  fetchRepoSettings as fetchRepoSettingsAction,
  updateRepoSettings as updateRepoSettingsAction,
  previewRepoCommits as previewRepoCommitsAction,
  generateChangelogFromCommits as generateChangelogFromCommitsAction,
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

export async function loginAdmin(input: { email: string; password: string }) {
  return loginAdminAction(input)
}

export async function registerAdmin(input: { email: string; password: string; displayName?: string }) {
  return registerAdminAction(input)
}

export async function canRegisterAdmin() {
  return canRegisterAdminAction()
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

export async function fetchRepoSettings() {
  return fetchRepoSettingsAction()
}

export async function updateRepoSettings(input: unknown) {
  return updateRepoSettingsAction(input)
}

export async function previewRepoCommits(input: unknown) {
  return previewRepoCommitsAction(input)
}

export async function generateChangelogFromCommits(input: unknown) {
  return generateChangelogFromCommitsAction(input)
}
