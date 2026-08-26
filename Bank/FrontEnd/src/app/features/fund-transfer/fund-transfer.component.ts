import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: `bnk-fund-transfer`,
  template: `<!--  -->
    <div class="app-layout-wrapper">
      <header class="app-top-nav" role="banner">
        <div class="nav-branding">
          <div class="core-logo">RBC_UX</div>
          <h1>Unified Wealth Ecosystem</h1>
          <button id="theme-switcher" class="btn-nav-logout">🌓 Toggle Theme</button>
        </div>
        <nav class="nav-links-cluster" aria-label="Primary Portal Navigation">
          <a routerLink="/" class="nav-anchor">Overview</a>
          <a routerLink="/money-transfer" class="nav-anchor current">Move Fund</a>
          <button routerLink="/logout" class="btn-nav-logout">Secure Sign Out</button>
        </nav>
      </header>

      <div class="container-main">
        <main class="workspace-panel small-bounds" role="main">
          <header class="workspace-heading">
            <h2>Execute Capital Transfer</h2>
            <p>Instantly route transaction assets inside internal clearings or setup external wire executions.</p>
          </header>

          <section class="table-container-card form-pad">
            <form action="#" method="POST">
              <div class="form-field">
                <label for="source-node">Debit Source Account</label>
                <select id="source-node" required>
                  <option value="">Select origin account stream...</option>
                  <option value="chk">RBC VIP Checking (•••• 4059) — Balance: $14,842.50</option>
                  <option value="sav">High-Growth Savings (•••• 9102) — Balance: $85,210.00</option>
                </select>
              </div>

              <div class="form-field">
                <label for="destination-node">Target Credit Destination</label>
                <select id="destination-node" required>
                  <option value="">Select recipient target location...</option>
                  <option value="sav">High-Growth Savings (•••• 9102)</option>
                  <option value="inv">Direct Investment Margin (•••• 7710)</option>
                  <option value="external">Add New External Transfer Target Node...</option>
                </select>
              </div>

              <div class="form-field">
                <label for="transfer-magnitude">Allocation Amount (CAD)</label>
                <div class="input-currency-wrapper">
                  <span class="currency-prefix" aria-hidden="true">$</span>
                  <input type="number" id="transfer-magnitude" required min="1" max="50000" step="0.01" placeholder="0.00" />
                </div>
                <span class="input-hint">Maximum daily instant processing limit: $50,000.00 CAD.</span>
              </div>

              <div class="form-field">
                <label for="transfer-memo">Execution Memo (Optional)</label>
                <input type="text" id="transfer-memo" placeholder="Internal Allocation Transfer" />
              </div>

              <div class="execution-warning-alert" role="alert"><strong>Execution Notice:</strong> Once authorized, funds are moved instantly through microservice channels. Verify routing values.</div>

              <div class="form-actions-row">
                <button type="button" class="btn-secondary-action">Cancel Order</button>
                <button type="submit" class="btn-primary-action fit-content">Authorize Capital Transfer</button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>`,
})
export class FundTransferComponent {}
