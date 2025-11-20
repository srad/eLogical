<template>
  <div class="terms">
    <div class="container">
      <!-- Imprint Section -->
      <div class="d-flex flex-column gap-2">
        <h5>Developer</h5>
        <p class="mb-2">
          Saman Sedighi Rad<br>
          Contact: <a href="mailto:saman.sr@gmail.com">sama.sr@gmail.com</a><br/>
          Website: <a target="_blank" href="https://www.sedrad.com">https://sedrad.com</a>
        </p>
      </div>

      <br/>

      <!-- Data Privacy Section -->
      <div class="d-flex flex-column gap-2">
        <h2>Data Privacy & Policy</h2>

        <div>
          <h5>1. Overview</h5>
          <p class="mb-2">
            eLogical is a privacy-first application. We are committed to protecting your privacy and ensuring you have a positive experience on our app. This privacy policy explains how we handle your data.
          </p>
        </div>

        <div>
          <h5>2. Data Storage</h5>
          <p class="mb-2">
            <strong>All data is stored locally on your device.</strong> We do not transmit, store, or process any of your personal data on external servers or cloud services. Your game scores, gameplay history, preferences, and analytics data remain entirely on your device.
          </p>
        </div>

        <div>
          <h5>3. What Data We Collect</h5>
          <p class="mb-2">
            The app may collect the following data locally on your device:
          </p>
          <ul class="mb-2">
            <li><strong>Game Scores:</strong> Your game performance and high scores</li>
            <li><strong>Gameplay Events:</strong> Tracking of gameplay interactions for analytics</li>
            <li><strong>User Preferences:</strong> Your app settings and configurations</li>
            <li><strong>Usage Statistics:</strong> Anonymous gameplay statistics for analytics</li>
          </ul>
          <p class="mb-2">
            All of this data is stored exclusively on your device using IndexedDB technology and is never transmitted to any external server.
          </p>
        </div>

        <div>
          <h5>4. Data Sharing</h5>
          <p class="mb-2">
            <strong>We do not share, sell, or transfer any of your data to third parties.</strong> Your data is not used for advertising, marketing, or any purpose other than to enhance your personal gaming experience.
          </p>
        </div>

        <div>
          <h5>5. Tracking</h5>
          <p class="mb-2">
            The app includes optional gameplay event tracking for analytics purposes. This feature:
          </p>
          <ul class="mb-2">
            <li>Collects data exclusively on your device</li>
            <li>Can be disabled at any time in the Settings section</li>
            <li>Is never transmitted to external services</li>
            <li>Is used only to generate statistics visible to you</li>
          </ul>
        </div>

        <div>
          <h5>6. Third-Party Services</h5>
          <p class="mb-2">
            eLogical does not integrate with or share data with third-party services, analytics platforms, advertising networks, or any external services. Your data remains completely under your control.
          </p>
        </div>

        <div>
          <h5>7. Data Deletion</h5>
          <p class="mb-2">
            You have complete control over your data. You can delete all stored data at any time using the "Clear All Data" option in the Settings section. Once deleted, this data cannot be recovered.
          </p>
        </div>

        <div>
          <h5>8. App Permissions</h5>
          <p class="mb-2">
            The app requires minimal permissions and only accesses resources necessary for core functionality. The app does not access:
          </p>
          <ul class="mb-2">
            <li>Your personal files or documents</li>
            <li>Your contacts or social media accounts</li>
            <li>Your location information</li>
            <li>Your camera or microphone</li>
            <li>Your internet connection (data is not transmitted)</li>
          </ul>
        </div>

        <div>
          <h5>9. Security</h5>
          <p class="mb-2">
            Your data is secured through device-level encryption provided by your operating system. Since all data is stored locally on your device, it is protected by your device's built-in security measures.
          </p>
        </div>

        <div>
          <h5>10. Children's Privacy</h5>
          <p class="mb-2">
            eLogical does not knowingly collect data from children under 13. The app is designed as a privacy-respecting educational tool suitable for all ages. No personal information is collected or transmitted.
          </p>
        </div>

        <div>
          <h5>11. Changes to This Policy</h5>
          <p class="mb-2">
            We may update this privacy policy from time to time. Any changes will be reflected in the app. Your continued use of the app following the posting of revised Privacy Policy means that you accept and agree to the changes.
          </p>
        </div>

        <div>
          <h5>12. Contact Us</h5>
          <p class="mb-2">
            If you have any questions or concerns about this privacy policy or our privacy practices, please contact us at:<br>
            <strong>Email:</strong> privacy@elogical.app
          </p>
        </div>

        <div class="alert alert-info mb-0">
          <strong>Summary:</strong> eLogical respects your privacy. All your data stays on your device. We don't collect, share, or transmit your information to anyone. You have full control to view, manage, and delete your data at any time.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational component with no reactive state
</script>

<style scoped>
.terms {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.terms h2 {
  color: #333;
  font-weight: 600;
  margin-bottom: 0rem;
  border-bottom: 2px solid #3dda54;
  padding-bottom: 0.5rem;
}

.terms h5 {
  color: #495057;
  font-weight: 600;
  margin-top: 0.5rem;
}

.terms p {
  color: #666;
  line-height: 1.6;
}

.terms ul {
  color: #666;
  line-height: 1.6;
  padding-left: 1.5rem;
}

.terms li {
  margin-bottom: 0.5rem;
}

.terms hr {
  border-color: #dee2e6;
}

.terms .alert {
  border-radius: 6px;
}
</style>
