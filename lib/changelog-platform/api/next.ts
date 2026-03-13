import type { ChangelogApiClient } from './types'
import {
  canRegisterAdmin,
  checkAdminAuth,
  createChangelog,
  deleteChangelog,
  fetchAdminChangelogs,
  fetchAdminChangelogById,
  fetchAIProviderModels,
  fetchAISettings,
  fetchChangelogBySlug,
  fetchChangelogSettings,
  fetchLatestPublishedVersion,
  fetchPublishedChangelogs,
  fetchRepoSettings,
  generateChangelogFromCommits,
  loginAdmin,
  logoutAdmin,
  previewRepoCommits,
  registerAdmin,
  runAIEnhance,
  updateAISettings,
  updateChangelog,
  updateChangelogSettings,
  updateRepoSettings,
} from '../actions/changelog-actions'

export function createNextChangelogApi(): ChangelogApiClient {
  return {
    getFeed(params = {}) {
      return fetchPublishedChangelogs(params.page ?? 1, params.limit ?? 10, params.tags, params.search)
    },

    getEntryBySlug(slug) {
      return fetchChangelogBySlug(slug)
    },

    getAdminFeed(params = {}) {
      return fetchAdminChangelogs(params.page ?? 1, params.limit ?? 20)
    },

    getAdminEntryById(id) {
      return fetchAdminChangelogById(id)
    },

    createEntry(input) {
      return createChangelog(input)
    },

    updateEntry(id, input) {
      return updateChangelog({ ...(input as object), id })
    },

    deleteEntry(id) {
      return deleteChangelog(id)
    },

    login(input) {
      return loginAdmin(input)
    },

    register(input) {
      return registerAdmin(input)
    },

    canRegister() {
      return canRegisterAdmin()
    },

    logout() {
      return logoutAdmin()
    },

    checkAdminAuth() {
      return checkAdminAuth()
    },

    enhance(input) {
      return runAIEnhance(input)
    },

    getAISettings() {
      return fetchAISettings()
    },

    updateAISettings(input) {
      return updateAISettings(input)
    },

    listModels(input) {
      return fetchAIProviderModels(input)
    },

    getChangelogSettings() {
      return fetchChangelogSettings()
    },

    updateChangelogSettings(input) {
      return updateChangelogSettings(input)
    },

    getLatestPublishedVersion() {
      return fetchLatestPublishedVersion()
    },

    getRepoSettings() {
      return fetchRepoSettings()
    },

    updateRepoSettings(input) {
      return updateRepoSettings(input)
    },

    previewRepoCommits(input) {
      return previewRepoCommits(input)
    },

    generateChangelogFromCommits(input) {
      return generateChangelogFromCommits(input)
    },
  }
}
