package com.localloop.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.*
import android.widget.EditText
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.localloop.app.databinding.ActivityMainBinding
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Activity Result Launcher for File Chooser (Camera & Gallery for Seller Banner / Product Uploads)
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            if (data == null || data.data == null) {
                // If no data intent was returned, check if camera captured an image
                cameraImageUri?.let { results = arrayOf(it) }
            } else {
                data.data?.let { results = arrayOf(it) }
            }
        }
        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    // Permission Launcher
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        if (!cameraGranted) {
            Toast.makeText(this, "Camera permission optional; gallery picker available", Toast.LENGTH_SHORT).show()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupSwipeRefresh()
        setupWebView()
        setupBackButtonHandler()
        setupButtons()
        checkPermissions()

        loadCurrentServerUrl()
    }

    private fun checkPermissions() {
        val permissionsToRequest = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }
        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setColorSchemeColors(
            ContextCompat.getColor(this, R.color.localloop_terracotta)
        )
        binding.swipeRefresh.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings = binding.webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true // Required for Cart & LocalStorage
        webSettings.databaseEnabled = true
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.useWideViewPort = true
        webSettings.loadWithOverviewMode = true
        webSettings.setSupportZoom(false)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            CookieManager.getInstance().setAcceptThirdPartyCookies(binding.webView, true)
        }

        // Custom User Agent identifier
        val defaultUserAgent = webSettings.userAgentString
        webSettings.userAgentString = "$defaultUserAgent LocalLoopAndroid/1.0.0"

        // Expose Native Bridge
        binding.webView.addJavascriptInterface(WebAppInterface(this), "LocalLoopNative")

        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
                binding.layoutError.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                showErrorScreen(failingUrl)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showErrorScreen(request.url.toString())
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val scheme = uri.scheme?.lowercase(Locale.ROOT)

                // Handle native dialer, mail, and external app intents
                if (scheme == "tel" || scheme == "mailto" || scheme == "sms" || scheme == "whatsapp") {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, uri))
                        return true
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "No application found to handle this action", Toast.LENGTH_SHORT).show()
                        return true
                    }
                }

                // Internal app URLs stay inside WebView
                return false
            }
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                binding.progressBar.progress = newProgress
                if (newProgress >= 100) {
                    binding.progressBar.visibility = View.GONE
                }
            }

            // Handles file picking (Camera + Gallery) for store banner and product uploads
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                var takePictureIntent: Intent? = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                if (takePictureIntent?.resolveActivity(packageManager) != null) {
                    var photoFile: File? = null
                    try {
                        photoFile = createImageFile()
                    } catch (ex: IOException) {
                        // Error occurred while creating the File
                    }
                    if (photoFile != null) {
                        cameraImageUri = FileProvider.getUriForFile(
                            this@MainActivity,
                            "${applicationContext.packageName}.fileprovider",
                            photoFile
                        )
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                    } else {
                        takePictureIntent = null
                    }
                }

                val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "image/*"
                }

                val intentArray: Array<Intent?> = takePictureIntent?.let { arrayOf(it) } ?: arrayOfNulls(0)

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                    putExtra(Intent.EXTRA_TITLE, "Upload Store Banner or Product Image")
                    putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                }

                fileChooserLauncher.launch(chooserIntent)
                return true
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }
        }
    }

    private fun setupBackButtonHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun setupButtons() {
        binding.btnRetry.setOnClickListener {
            binding.layoutError.visibility = View.GONE
            loadCurrentServerUrl()
        }

        binding.btnChangeServer.setOnClickListener {
            showServerSelectionDialog()
        }

        binding.pillServerSwitch.setOnClickListener {
            showServerSelectionDialog()
        }
    }

    private fun loadCurrentServerUrl() {
        val targetUrl = AppConfig.getTargetUrl(this)
        binding.txtCurrentTargetUrl.text = targetUrl

        // Update floating pill text
        val uri = Uri.parse(targetUrl)
        val hostDisplay = uri.host ?: "LocalLoop"
        binding.txtPillHost.text = "$hostDisplay:${uri.port.takeIf { it > 0 } ?: 3000}"

        binding.webView.loadUrl(targetUrl)
    }

    private fun showErrorScreen(failingUrl: String?) {
        binding.swipeRefresh.isRefreshing = false
        binding.progressBar.visibility = View.GONE
        binding.layoutError.visibility = View.VISIBLE
        binding.txtCurrentTargetUrl.text = failingUrl ?: AppConfig.getTargetUrl(this)
    }

    private fun showServerSelectionDialog() {
        val options = arrayOf(
            getString(R.string.server_emulator),
            getString(R.string.server_lan),
            getString(R.string.prod_host),
            getString(R.string.server_custom)
        )

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.select_server_title))
            .setItems(options) { _, which ->
                when (which) {
                    0 -> {
                        AppConfig.setTargetUrl(this, AppConfig.DEFAULT_EMULATOR_URL)
                        loadCurrentServerUrl()
                    }
                    1 -> {
                        AppConfig.setTargetUrl(this, AppConfig.DEFAULT_LAN_URL)
                        loadCurrentServerUrl()
                    }
                    2 -> {
                        AppConfig.setTargetUrl(this, AppConfig.DEFAULT_PROD_URL)
                        loadCurrentServerUrl()
                    }
                    3 -> {
                        showCustomUrlDialog()
                    }
                }
            }
            .setNegativeButton(getString(R.string.cancel), null)
            .show()
    }

    private fun showCustomUrlDialog() {
        val input = EditText(this).apply {
            hint = "http://192.168.x.x:3000"
            setText(AppConfig.getTargetUrl(this@MainActivity))
            setSelection(text.length)
        }

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.enter_custom_url))
            .setView(input)
            .setPositiveButton(getString(R.string.save)) { _, _ ->
                val entered = input.text.toString().trim()
                if (entered.isNotEmpty()) {
                    val formatted = if (!entered.startsWith("http://") && !entered.startsWith("https://")) {
                        "http://$entered"
                    } else {
                        entered
                    }
                    AppConfig.setTargetUrl(this, formatted)
                    loadCurrentServerUrl()
                }
            }
            .setNegativeButton(getString(R.string.cancel), null)
            .show()
    }

    @Throws(IOException::class)
    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val storageDir: File? = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JPEG_${timeStamp}_", ".jpg", storageDir)
    }
}
