# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-26

### Added
- **Authentication System**:
  - User registration and login functionality.
  - Profile image uploads via Multer.
  - Numeric code email verification mechanism for newly registered users.
  - Role-based authorization (`admin` and standard `user`).
- **Artwork Submissions & Gallery**:
  - Portal for members to upload artworks, titles, descriptions, and categories.
  - Admin curation panel to approve, reject, grade/score, and prioritize the ordering of artworks.
  - Public gallery view displaying approved artworks in a responsive grid.
- **Event Management System**:
  - Categorization of events into Workshops, Competitions, and general Club Events.
  - Admin tools to create, edit, and delete events with promotional poster uploads.
  - Event application system for authenticated users.
  - Interactive selection dashboard allowing admins to pin events to the landing page carousel or archive sections.
- **E-Exhibitions**:
  - Virtual gallery module allowing admins to curate online exhibitions with descriptive titles and details.
- **Contact Forms**:
  - User-facing contact form for queries.
  - Admin contact query response board.
- **Rich Visual Interface**:
  - Smooth route transitions using Framer Motion.
  - Infinite photo looping carousel component for the landing page.
  - Custom brand splash screen and loading skeletons.
- **System Administration**:
  - Admin action audit logging to trace modifications (approved artworks, created events, promoted users).
  - Admin promotion interface.
  - Dashboard stats controls.
