'use server'

import { createNextChangelogAdapter } from './create-adapter'

const adapter = createNextChangelogAdapter()
const actions = adapter.actions

export const createChangelog = actions.createChangelog
export const updateChangelog = actions.updateChangelog
export const deleteChangelog = actions.deleteChangelog
export const fetchChangelogBySlug = actions.fetchChangelogBySlug
export const fetchPublishedChangelogs = actions.fetchPublishedChangelogs
export const fetchAdminChangelogs = actions.fetchAdminChangelogs
export const fetchAdminChangelogById = actions.fetchAdminChangelogById
export const runAIEnhance = actions.runAIEnhance
export const loginAdmin = actions.loginAdmin
export const logoutAdmin = actions.logoutAdmin
export const checkAdminAuth = actions.checkAdminAuth
export const fetchAISettings = actions.fetchAISettings
export const fetchAIProviderModels = actions.fetchAIProviderModels
export const updateAISettings = actions.updateAISettings
export const fetchLatestPublishedVersion = actions.fetchLatestPublishedVersion
export const fetchChangelogSettings = actions.fetchChangelogSettings
export const updateChangelogSettings = actions.updateChangelogSettings
