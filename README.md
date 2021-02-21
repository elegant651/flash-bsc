# Flash BSC

## Leveraged Loan

To make it easy to create a leveraged position, the `BEP20FlashLoan` can utilise a flashloan together. The contract needs to have some `BUSD` before executing the action.

Here's scenario.
1. Lender deposits 1 BUSD into the lending pool contract. Lender expects a return of yield for a successful flash loan.
2. Borrower can borrow the tokens and leveraged deposit to gain yield within flashloan time. it convert to vtoken from BEP token.
3. Once transaction is about to confirm, as `withdraw`, it convert vtoken to token in Venus protocol, repay the token to lender.

Smart contract: We use Binance smart chain testnet to deploy smart contracts. \
- BEP20FlashBorrower.sol : Flash loan, which includes mint and get vToken at first, then borrow enough asset to buy back. Once done, pay back flashloan then convert vToken to token as withdraw. it inherit from `Venus.sol`
- BEP20FlashLoan.sol : it send to borrower the tokens and execute flash loan. And  after flash loan, it repay the dept.
- flashModule.sol : Borrower contract, which inherit from `BEP20FlashBorrower.sol`
- depositPool.sol : Lender can deposit the BEP token. it inherit from `BEP20FlashLoan.sol`
- Venus.sol : `https://docs.venus.io/docs/vtokens`

Frontend: React, web3 library, bootstrap

Contract Address (BSC Testnet):
depositPool: 0x40D6f23146F2B96821b2451b8C7d94645d675Fc6
flashModule: 0x78F5DD08A3333F8537AC115fB2FE87A8771b9057

[WIP]

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
