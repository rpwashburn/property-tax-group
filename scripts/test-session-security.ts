import { runAllSessionTests, formatTestResults } from '../src/lib/session-testing';

async function runTests() {
  try {
    console.log('🔒 Running Session Security Tests...\n');
    
    const { results, summary } = await runAllSessionTests();
    
    console.log(formatTestResults(results));
    
    console.log('📊 Test Summary:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    
    if (summary.failed === 0) {
      console.log('\n🎉 All session security tests passed!');
    } else {
      console.log(`\n⚠️  ${summary.failed} tests failed. Please review the recommendations above.`);
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests(); 